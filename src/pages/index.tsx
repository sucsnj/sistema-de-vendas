import { FormEvent, useState, useEffect, useRef } from 'react';
import DailySaleForm from '../components/DailySaleForm';
import DailySalesTotal from '../components/DailySalesTotal';
import SalesChart from '../components/SalesChart';
import SalesTable from '../components/SalesTable';
import Toast from '../components/Toast';
import ExportButtons from '../components/ExportButtons';
import { buscarVendasDiarias, consolidarMensal, fazerBackup, atualizarVenda, excluirVenda, VendaDiaria } from '../services/vendasService';

const Home: React.FC = () => {
  const [sales, setSales] = useState<VendaDiaria[]>([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingSale, setEditingSale] = useState<VendaDiaria | null>(null);
  const [editData, setEditData] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  const editValorInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadSales();
  }, [mes, ano]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setThemeMode(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (themeMode === 'system') {
      document.documentElement.classList.remove('light', 'dark');
    } else {
      document.documentElement.classList.add(themeMode);
      document.documentElement.classList.remove(themeMode === 'light' ? 'dark' : 'light');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', themeMode);
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((current) =>
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system'
    );
  };

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

  const handleSaveEdit = async (e: React.FormEvent) => {
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
    try {
      await excluirVenda(id);
      showToast('Venda excluída com sucesso.', 'success');
      loadSales();
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
    <div className="page-container">
      <div className="top-bar">
        <h1>Dashboard de Vendas</h1>
        <button type="button" className="theme-toggle" onClick={toggleThemeMode}>
          {themeMode === 'system'
            ? 'Modo: Sistema'
            : themeMode === 'light'
            ? 'Modo: Claro'
            : 'Modo: Escuro'}
        </button>
      </div>
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
          <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>
            Cancelar
          </button>
        </form>
      )}
      <SalesChart data={sales} />
      <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} />
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
            <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
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
          <button onClick={handleConsolidate}>Consolidar Mês</button>
          <button onClick={handleBackup}>Fazer Backup</button>
        </div>
      </div>
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="top-right" />
    </div>
  );
};

export default Home;

<style jsx>{`
  .page-container {
    max-width: 1220px;
    margin: 0 auto;
    padding: 28px 22px 30px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    font-size: 0.82rem;
  }

  .top-bar {
    position: relative;
    display: flex;
    align-items: center;
    padding: 12px 18px;
    border-radius: 14px;
    background: var(--surface);
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
  }

  .top-bar h1 {
    font-size: 1.25rem;
    margin: 0;
  }

  .theme-toggle {
    position: absolute;
    top: 50%;
    right: 18px;
    transform: translateY(-50%);
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: #2563eb;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .theme-toggle:hover {
    transform: translateY(-1px);
    background: #1d4ed8;
  }

  .footer-header {
    padding: 18px;
  }

  .page-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-end;
  }

  .page-actions label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.95rem;
  }

  .page-actions select,
  .page-actions input {
    min-width: 140px;
  }

  .page-actions button {
    padding: 8px 14px;
    font-size: 0.92rem;
  }

  h1 {
    font-size: 1.35rem;
    margin-bottom: 0;
  }

  @media (max-width: 900px) {
    .page-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
`}</style>