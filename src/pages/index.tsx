import { FormEvent, useState, useEffect, useRef } from 'react';
import DailySaleForm from '../components/DailySaleForm';
import DailySalesTotal from '../components/DailySalesTotal';
import SalesChart from '../components/SalesChart';
import Toast from '../components/Toast';
import dayjs from 'dayjs';
import ExportButtons from '../components/ExportButtons';
import {
  buscarVendasDiarias,
  consolidarMensal,
  fazerBackup,
  atualizarVenda, excluirVenda,
  VendaDiaria,
  autoConsolidar
} from '../services/vendasService';
import { capitalize } from '../utils/captalize';
import { canEdit } from '../utils/edit';

const hoje = dayjs().format('YYYY-MM-DD');

const Home: React.FC = () => {
  const [sales, setSales] = useState<VendaDiaria[]>([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(hoje);
  const [editingSale, setEditingSale] = useState<VendaDiaria | null>(null);
  const [editData, setEditData] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const editValorInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadSales();
  }, [mes, ano]);

  const loadSales = async () => {
    const data = await buscarVendasDiarias(mes, ano);
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
    setEditData(sale.data);
    setEditValor(sale.valor.toFixed(2));
    setEditObservacoes(sale.observacoes ?? '');
  };

  useEffect(() => {
    if (editingSale) {
      editValorInputRef.current?.focus();
      editValorInputRef.current?.select();
    }
  }, [editingSale]);

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    try {
      await atualizarVenda(editingSale.id, editData, parseFloat(editValor), editObservacoes);
      showToast('Venda atualizada com sucesso.', 'success');
      setEditingSale(null);
      loadSales();
    } catch (error) {
      showToast('Erro ao salvar alteração.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
    setEditData('');
    setEditValor('');
    setEditObservacoes('');
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
      const dateA = new Date(`${a.data}T00:00:00`).getTime();
      const dateB = new Date(`${b.data}T00:00:00`).getTime();
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
          <form onSubmit={handleSaveEdit} className="glass-form">
            <h2>Editar Venda</h2>
            <label>
              Data:
              <input
                type="date"
                value={editData}
                onChange={(e) => setEditData(e.target.value)}
                required
              />
            </label>
            <label>
              Valor:
              <input
                ref={editValorInputRef}
                type="number"
                step="0.01"
                value={editValor}
                onChange={(e) => setEditValor(e.target.value)}
                required
              />
            </label>
            <label>
              Observações:
              <textarea
                value={editObservacoes}
                onChange={(e) => setEditObservacoes(e.target.value)}
              />
            </label>
            <button type="submit">Salvar Alteração</button>
            <button type="button" onClick={handleCancelEdit} className="button-spacing">
              Cancelar
            </button>
          </form>
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
                    {capitalize(new Date(0, i).toLocaleString('pt-BR', { month: 'long' }))}
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
            <button className="headerButton" onClick={handleConsolidate}>Consolidar Mês</button>
            <button className="headerBackupButton" onClick={handleBackup}>Fazer Backup</button>
          </div>
        </div>
        <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />
      </div>
    </>
  );
};

export default Home;