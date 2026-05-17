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

  return (
    <div className="table-container">
      <h2>Vendas Diárias
        - <span>Total R$ {totalVendas.toFixed(2)}</span>
      </h2>
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
            // .slice(0, 50)
            .sort((a, b) => {
              const diffDate =
                new Date(b.data).getTime() - new Date(a.data).getTime();

              if (diffDate !== 0) return diffDate;

              return b.id - a.id;
            })
            .map((sale) => (
              <tr key={sale.id}>
                <td>{dayjs(sale.data).format('DD-MM-YYYY')}</td>
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