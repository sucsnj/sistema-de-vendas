import { useEffect, useState } from 'react';
import SalesTable from '../components/sales/SalesTable';
import ExportButtons from '../components/sales/ExportButtons';
import EditSaleForm from '../components/sales/EditSaleForm';
import { capitalize } from '../utils/captalize';
import { getDateArray, formatMonthName } from '../utils/date';
import { useToast } from '../hooks/useToast';
import { useSales } from '../hooks/useSales';
import { useFilter } from '../hooks/useFilter';

// Componente React: tela de Histórico de Vendas.
// Lista as vendas do período com filtro (todas/positivas/negativas), permitindo
// editar e excluir. Usa os hooks useToast, useSales e useFilter.
const History: React.FC = () => {
  // Período selecionado (mês e ano), usado para carregar as vendas
  const [month, setMonth] = useState(getDateArray()[1]);
  const [year, setYear] = useState(getDateArray()[2]);

  // Notificações (toast) exibidas na tela
  const { showToast } = useToast();
  // Filtro de vendas (persistido no localStorage)
  const { filter, changeFilter } = useFilter();
  // Estado e ações de vendas (carregar, editar, excluir). Aqui o autoConsolidate
  // fica desligado e o filtro é dinâmico, diferente do dashboard.
  const {
    sales,
    editingSale,
    loadSales,
    handleEditSale,
    handleCancelEdit,
    handleSaved,
    handleDeleteSale,
  } = useSales(month, year, showToast, { filter, autoConsolidate: false });

  // Recarrega as vendas sempre que o período ou o filtro mudar
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return (
    <>
      <div className="container-padding">
        <h1>Histórico de Vendas</h1>
        {/* Filtro de período e botões de valor */}
        <div className="glass-form">
          <div className="page-actions">
            <label>
              Mês:
              <select className="headerSelect" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
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
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              />
            </label>
            {/* Botões de filtro por valor da venda */}
            <div className="buttons-filter">
              <button className={filter === 'todas' ? 'color-muted' : 'button-todas'} onClick={() => changeFilter('todas')}>
                Todas
              </button>
              <button className={filter === 'positivas' ? 'color-muted' : 'button-positivas'} onClick={() => changeFilter('positivas')}>
                Positivas
              </button>
              <button className={filter === 'negativas' ? 'color-muted' : 'button-negativas'} onClick={() => changeFilter('negativas')}>
                Negativas
              </button>

            </div>
          </div>
        </div>

        {/* Formulário de edição (visível apenas quando há uma venda em edição) */}
        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSaved={handleSaved}
            onCancel={handleCancelEdit}
            onToast={showToast}
          />
        )}

        {/* Tabela com as vendas do período */}
        <SalesTable sales={sales} onEditSale={handleEditSale} onDeleteSale={handleDeleteSale} />
        {/* Exportação e importação de vendas */}
        <ExportButtons sales={sales} month={month} year={year} onMessage={showToast} />
      </div>
    </>
  );
};

export default History;