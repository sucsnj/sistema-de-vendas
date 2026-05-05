import { VendaDiaria } from '../services/vendasService';

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

  return (
    <div className="table-container">
      <h2>Vendas Diárias</h2>
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
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.data}</td>
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
                      <button type="button" className="delete-button" onClick={() => onDeleteSale(sale.id)} style={{ marginLeft: '8px' }}>
                        Excluir
                      </button>
                    ) : null}
                  </>
                ) : (
                  <span style={{ color: '#777' }}>Bloqueado</span>
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