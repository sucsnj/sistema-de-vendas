import { FormEvent, useState, useEffect, useRef } from 'react';
import SalesTable from '../components/SalesTable';
import Toast from '../components/Toast';
import ExportButtons from '../components/ExportButtons';
import parseNumber from '../utils/number';
import { formatMonthName } from '../utils/date';
import { buscarVendasDiarias, atualizarVenda, excluirVenda, VendaDiaria } from '../services/vendasService';

const Historico: React.FC = () => {
  const [sales, setSales] = useState<VendaDiaria[]>([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
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
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => {
    setToastOpen(false);
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    try {
      await atualizarVenda(editingSale.id, editData, parseNumber(editValor), editObservacoes);
      showToast('Venda atualizada com sucesso.', 'success');
      setEditingSale(null);
      setEditData('');
      setEditValor('');
      setEditObservacoes('');
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
    try {
      await excluirVenda(id);
      showToast('Venda excluída com sucesso.', 'success');
      loadSales();
    } catch (error) {
      showToast('Erro ao excluir venda.', 'error');
    }
  };

  return (
    <div className="container-padding">
      <h1>Histórico de Vendas</h1>
      <div>
        <label>
          Mês:
          <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {formatMonthName(i + 1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ano:
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
          />
        </label>
      </div>
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
      <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} />
      <ExportButtons sales={sales} mes={mes} ano={ano} onMessage={showToast} />
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />
    </div>
  );
};

export default Historico;