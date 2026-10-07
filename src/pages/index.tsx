import { useEffect, useState } from 'react';
import DailySaleForm from '../components/DailySaleForm';
import DailySalesTotal from '../components/DailySalesTotal';
import SalesChart from '../components/SalesChart';
import ExportButtons from '../components/ExportButtons';
import EditSaleForm from '../components/EditSaleForm';
import { useToast } from '../hooks/useToast';
import { useVendas } from '../hooks/useVendas';
import { capitalize } from '../utils/captalize';
import BackupIcon from '@mui/icons-material/Backup';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getDateArray, now, toTimestamp, formatMonthName } from '../utils/date';

// Data de hoje (fuso do app) usada como seleÃ§Ã£o inicial do formulÃ¡rio
const hoje = now().format('YYYY-MM-DD');

// Componente React da pÃ¡gina inicial: Dashboard de Vendas.
// Orquestra os subcomponentes da tela usando os hooks useToast e useVendas,
// mantendo apenas o estado de filtro (mÃªs/ano) e da data selecionada.
const Home: React.FC = () => {
  // PerÃ­odo de hoje (mÃªs/ano no fuso do app), calculado uma Ãºnica vez
  const [, mesAtual, anoAtual] = getDateArray();
  // PerÃ­odo selecionado (mÃªs e ano), usado para carregar as vendas
  const [mes, setMes] = useState(mesAtual);
  const [ano, setAno] = useState(anoAtual);
  // Ano exibido no campo; aceita digitaÃ§Ã£o livre e sÃ³ comita valores vÃ¡lidos
  const [anoInput, setAnoInput] = useState(String(anoAtual));
  // Data selecionada no formulÃ¡rio de venda diÃ¡ria
  const [selectedDate, setSelectedDate] = useState(hoje);

  // NotificaÃ§Ãµes (toast) exibidas na pÃ¡gina
  const { showToast } = useToast();
  // Estado e aÃ§Ãµes de vendas (carregar, editar, excluir, consolidar, backup)
  const {
    sales,
    loading,
    editingSale,
    loadSales,
    handleConsolidate,
    handleBackup,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  } = useVendas(mes, ano, showToast);

  // Recarrega as vendas sempre que o perÃ­odo (mes/ano) mudar
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Ãšltimas 4 vendas (por data e id, da mais recente para a mais antiga)
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
        {loading && <p className="loading-text">Carregando vendas...</p>}
        {/* Resumo do perÃ­odo + formulÃ¡rio de registro de venda */}
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

        {/* FormulÃ¡rio de ediÃ§Ã£o (visÃ­vel apenas quando hÃ¡ uma venda em ediÃ§Ã£o) */}
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
        {/* RodapÃ© com filtro de perÃ­odo e aÃ§Ãµes de consolidaÃ§Ã£o/backup */}
        <div className="footer-header glass-form">
          <div className="page-actions">
            <label>
              MÃªs:
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
                value={anoInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnoInput(v);
                  const parsed = parseInt(v, 10);
                  if (!Number.isNaN(parsed)) setAno(parsed);
                }}
                onBlur={() => {
                  const parsed = parseInt(anoInput, 10);
                  if (Number.isNaN(parsed)) setAnoInput(String(ano));
                }}
              />
            </label>
            <button className="headerButton" onClick={handleConsolidate}>
              <DoneAllIcon />
              Consolidar MÃªs
            </button>
            <button className="headerBackupButton" onClick={handleBackup}>
              <BackupIcon />
              Fazer Backup
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
