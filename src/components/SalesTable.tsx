import React from 'react';
import { VendaDiaria } from '../services/vendasService';
import dayjs from 'dayjs';

interface SalesTableProps {
  sales: VendaDiaria[];
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, onEditSale, onDeleteSale }) => {
  const canEdit = (data: string) => {
    const saleDate = new Date(`${data}T00:00:00`);
    const today = new Date();
    const todayMidnight = new Date(today.toISOString().split('T')[0] + 'T00:00:00');
    const diffMs = todayMidnight.getTime() - saleDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 2;
  };

  const totalVendas = sales.reduce((total, sale) => total + sale.valor, 0);

  const changeMaxSales = (value: number) => {
    setMaxSales(value);
  };

  const [maxSales, setMaxSales] = React.useState(5);

  return (
    <div className="table-container">
      <h2>Vendas Diárias
        - <span>Total R$ {totalVendas.toFixed(2)}</span>
      </h2>
      <div className="range-buttons">
        <button
          className={maxSales === 100 ? 'color-muted' : 'button-100'}
          onClick={() => changeMaxSales(100)}
        >
          100 últimas
        </button>

        <button
          className={maxSales === 50 ? 'color-muted' : 'button-50'}
          onClick={() => changeMaxSales(50)}
        >
          50 últimas
        </button>

        <button
          className={maxSales === 25 ? 'color-muted' : 'button-25'}
          onClick={() => changeMaxSales(25)}
        >
          25 últimas
        </button>

        <button
          className={maxSales === sales.length ? 'color-muted' : 'button-todas'}
          onClick={() => changeMaxSales(sales.length)}
        >
          Todas
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Valor</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {[...sales]
            .sort((a, b) => {
              const diffDate =
                new Date(b.data).getTime() - new Date(a.data).getTime();

              if (diffDate !== 0) return diffDate;

              return b.id - a.id;
            })
            .slice(0, maxSales)
            .map((sale) => (
              <tr key={sale.id}>
                <td>{dayjs(sale.criado_em).format('DD-MM-YYYY HH:mm:ss')}</td>
                <td>R$ {sale.valor.toFixed(2)}</td>
                <td>{sale.observacoes || '-'}</td>
                <td>
                  {canEdit(sale.data) ? (
                    <>
                      {onEditSale ? (
                        <button type="button" className="edit-button" onClick={() => onEditSale(sale)}>
                          Editar
                        </button>
                      ) : null}
                      {onDeleteSale ? (
                        <button type="button" className="delete-button button-spacing-small" onClick={() => onDeleteSale(sale.id)}>
                          Excluir
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <span className="color-muted">Bloqueado</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;