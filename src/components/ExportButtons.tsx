import { useRef, type ChangeEvent, type FC } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { registrarVenda, VendaDiaria } from '../services/vendasService';

interface ExportButtonsProps {
  sales: VendaDiaria[];
  mes: number;
  ano: number;
  selectedDate?: string;
  onMessage?: (message: string, type: 'success' | 'error' | 'info') => void;
  onImportCompleted?: () => void;
}

const ExportButtons: FC<ExportButtonsProps> = ({
  sales,
  mes,
  ano,
  selectedDate,
  onMessage,
  onImportCompleted,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    onMessage?.(message, type);
  };

  const exportXLSX = async (mode: 'day' | 'month') => {
    if (mode === 'day' && !selectedDate) {
      notify('Selecione um dia antes de exportar por dia.', 'error');
      return;
    }

    const dataToExport =
      mode === 'day'
        ? sales.filter((sale) => sale.data === selectedDate)
        : sales;

    if (dataToExport.length === 0) {
      notify(
        mode === 'day'
          ? 'Nenhuma venda encontrada para exportar no dia selecionado.'
          : 'Nenhuma venda encontrada para exportar neste mês.',
        'error'
      );
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        mode === 'day'
          ? `vendas-dia-${selectedDate}.xlsx`
          : `vendas-mes-${mes}-${ano}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      notify('Arquivo XLSX gerado com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      notify('Erro ao exportar XLSX.', 'error');
    }
  };

  const triggerImport = (mode: 'day' | 'month') => {
    if (mode === 'day' && !selectedDate) {
      notify('Selecione um dia antes de importar por dia.', 'error');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.dataset.mode = mode;
      fileInputRef.current.click();
    }
  };

  const normalizeHeader = (header: string) => header.toString().trim().toLowerCase();

  const formatValue = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return NaN;
    return parseFloat(value.replace(',', '.'));
  };

  const dateMatchesMonth = (dateValue: string) => {
    const parsed = new Date(`${dateValue}T00:00:00`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getMonth() + 1 === mes &&
      parsed.getFullYear() === ano
    );
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const mode = event.currentTarget.dataset.mode as 'day' | 'month';
    event.target.value = '';

    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      if (rows.length === 0) {
        notify('Arquivo XLSX sem dados.', 'error');
        return;
      }

      const parsedItems: Array<{
        data: string;
        valor: number;
        observacoes?: string;
      }> = [];
      const errors: string[] = [];

      rows.forEach((row, index) => {
        const normalizedRow: Record<string, any> = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[normalizeHeader(key)] = row[key];
        });

        let dataValue = String(
          normalizedRow['data'] ||
            normalizedRow['date'] ||
            normalizedRow['dia'] ||
            ''
        ).trim();
        const valorValue =
          normalizedRow['valor'] || normalizedRow['value'] || normalizedRow['amount'];
        const observacoesValue =
          normalizedRow['observacoes'] ||
          normalizedRow['observações'] ||
          normalizedRow['obs'] ||
          '';

        if (!dataValue && mode === 'day') {
          dataValue = selectedDate ?? '';
        }

        if (!dataValue) {
          errors.push(`Linha ${index + 1}: data ausente.`);
          return;
        }

        if (mode === 'day' && selectedDate && dataValue !== selectedDate) {
          errors.push(
            `Linha ${index + 1}: a data deve ser igual ao dia selecionado (${selectedDate}).`
          );
          return;
        }

        if (mode === 'month' && !dateMatchesMonth(dataValue)) {
          errors.push(
            `Linha ${index + 1}: a data deve pertencer ao mês ${mes}/${ano}.`
          );
          return;
        }

        const valor = formatValue(valorValue);
        if (Number.isNaN(valor)) {
          errors.push(`Linha ${index + 1}: valor inválido.`);
          return;
        }

        parsedItems.push({
          data: dataValue,
          valor,
          observacoes: String(observacoesValue).trim() || undefined,
        });
      });

      if (errors.length > 0) {
        notify(errors[0], 'error');
        return;
      }

      if (parsedItems.length === 0) {
        notify('Não há linhas válidas para importar.', 'error');
        return;
      }

      await Promise.all(
        parsedItems.map((item) =>
          registrarVenda(item.data, item.valor, item.observacoes)
        )
      );

      notify(
        `Importação concluída com ${parsedItems.length} registro(s).`,
        'success'
      );
      onImportCompleted?.();
    } catch (error) {
      console.error('Erro ao importar XLSX:', error);
      notify('Erro ao importar XLSX.', 'error');
    }
  };

  const exportPDF = async () => {
    const element = document.querySelector('.table-container') as HTMLElement;
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`vendas-${mes}-${ano}.pdf`);
    }
  };

  return (
    <div className="export-buttons">
      <button type="button" onClick={() => exportXLSX('month')}>
        Exportar XLSX (Mês)
      </button>
      <button type="button" onClick={() => exportXLSX('day')} disabled={!selectedDate}>
        Exportar XLSX (Dia)
      </button>
      <button type="button" onClick={() => triggerImport('month')}>
        Importar XLSX (Mês)
      </button>
      <button type="button" onClick={() => triggerImport('day')} disabled={!selectedDate}>
        Importar XLSX (Dia)
      </button>
      <button type="button" onClick={exportPDF}>
        Exportar PDF
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        data-mode="month"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ExportButtons;
