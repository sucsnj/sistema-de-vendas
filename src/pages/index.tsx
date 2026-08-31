import { useState, useEffect } from 'react';
import DailySaleForm from '../components/DailySaleForm';
import DailySalesTotal from '../components/DailySalesTotal';
import SalesChart from '../components/SalesChart';
import Toast from '../components/Toast';
import dayjs from 'dayjs';
import ExportButtons from '../components/ExportButtons';
import EditSaleForm from '../components/EditSaleForm';
import {
  buscarVendasDiarias,
  consolidarMensal,
  fazerBackup,
  excluirVenda,
  VendaDiaria,
  autoConsolidar
} from '../services/vendasService';
import { capitalize } from '../utils/captalize';
import { canEdit } from '../utils/edit';
import BackupIcon from '@mui/icons-material/Backup';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getDateArray, toTimestamp, formatMonthName } from '../utils/date';

const hoje = dayjs().format('YYYY-MM-DD');

// Componente React.
const Home: React.FC = () => {
  const [sales, setSales] = useState<VendaDiaria[]>([]);
  const [mes, setMes] = useState(getDateArray()[1]);
  const [ano, setAno] = useState(getDateArray()[2]);
  const [selectedDate, setSelectedDate] = useState(hoje);
  const [editingSale, setEditingSale] = useState<VendaDiaria | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    loadSales();
  }, [mes, ano]);

  const loadSales = async () => {
    const data = await buscarVendasDiarias(mes, ano, 'positivas');
    setSales(data);

    await autoConsolidar();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => {
    setToastOpen(false);
  };

  const handleConsolidate = async () => {
    try {
      await consolidarMensal(mes, ano);
      showToast('O mês foi consolidado com sucesso.', 'success');
    } catch (error) {
      showToast('Não foi possível consolidar o mês.', 'error');
    }
  };

  const handleBackup = async () => {
    try {
      const result = await fazerBackup();
      showToast(result.message, 'success');
    } catch (error) {
      showToast('Não foi possível fazer o backup.', 'error');
    }
  };

  const handleEditSale = (sale: VendaDiaria) => {
    setEditingSale(sale);
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
  };

  const handleSaved = () => {
    setEditingSale(null);
    loadSales();
  };

  const handleDeleteSale = async (id: number) => {
    const edit = canEdit(sales.find((sale) => sale.id === id)?.data || '');
    try {
      // mostra outro toast quando a venda tiver mais de 2 dias
      if (edit) {
        await excluirVenda(id);
        showToast('Venda excluída com sucesso.', 'success');
        loadSales();
      } else {
        showToast('Não é possível editar ou excluir.', 'info');
      }
    } catch (error) {
      showToast('Erro ao excluir venda.', 'error');
    }
  };

  const recentSales = [...sales]
    .sort((a, b) => {
      const dateA = toTimestamp(`${a.data}T00:00:00`);
      const dateB = toTimestamp(`${b.data}T00:00:00`);
      if (dateA !== dateB) return dateB - dateA;
      return b.id - a.id;
    })
    .slice(0, 4);

  return (
    <>
      <div className="container-padding">
        <h1>Dashboard de Vendas</h1>
        <DailySalesTotal
          sales={sales}
          selectedDay={selectedDate}
          recentSales={recentSales}
          onEditSale={handleEditSale}
          onDeleteSale={handleDeleteSale}
        >
          <DailySaleForm
            sales={sales}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSaleAdded={loadSales}
            onEditSale={handleEditSale}
            onDeleteSale={handleDeleteSale}
            showHistory={false}
          />
        </DailySalesTotal>

        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSaved={handleSaved}
            onCancel={handleCancelEdit}
            onToast={showToast}
          />
        )}
        <SalesChart data={sales} />
        {/* <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} /> */}
        <ExportButtons
          sales={sales}
          mes={mes}
          ano={ano}
          selectedDate={selectedDate}
          onMessage={showToast}
          onImportCompleted={loadSales}
        />
        <div className="footer-header glass-form">
          <div className="page-actions">
            <label>
              Mês:
              <select className="headerSelect" value={mes} onChange={(e) => setMes(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {capitalize(formatMonthName(i + 1))}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ano:
              <input
                className="headerInput"
                type="number"
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value))}
              />
            </label>
            <button className="headerButton" onClick={handleConsolidate}>
              <DoneAllIcon />
              Consolidar Mês
            </button>
            <button className="headerBackupButton" onClick={handleBackup}>
              <BackupIcon />
              Fazer Backup
            </button>
          </div>
        </div>
        <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />
      </div>
    </>
  );
};

export default Home;
