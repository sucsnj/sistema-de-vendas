import React from 'react';
import { useState } from 'react';
import { VendaDiaria } from '../services/vendasService';
import { formatDate } from '../utils/date';
import { formatCurrency } from '../utils/formatter';
import styles from '../styles/contas.module.css';
import { canEdit } from '../utils/edit';
import ConfirmDialog from '@/components/ConfirmDialog';

interface SalesTableProps {
  sales: VendaDiaria[];
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, onEditSale, onDeleteSale }) => {
  const totalVendas = sales.reduce((total, sale) => total + sale.valor, 0);

  const [maxSales, setMaxSales] = React.useState(5);

  // estado para o diálogo
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("maxSales");
    if (saved) {
      setMaxSales(parseInt(saved));
    }
  }, []);

  const changeMaxSales = (value: number) => {
    setMaxSales(value);
    localStorage.setItem("maxSales", String(value));
  };

  const openConfirm = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  return (
    <div className="table-container">
      <h2>Vendas Diárias
        - <span>Total R$ {formatCurrency(totalVendas, 2)}</span>
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
            <th>Criado em</th>
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
                <td>{formatDate(sale.criado_em, 'DD-MM-YYYY HH:mm:ss')}</td>
                <td>{sale.data}</td>
                <td>R$ {formatCurrency(sale.valor, 2)}</td>
                <td>{sale.observacoes || '-'}</td>
                <td>
                  {canEdit(sale.data) ? (
                    <>
                      {onEditSale ? (
                        <button type="button" className={styles.editButton} onClick={() => onEditSale(sale)}>
                          Editar
                        </button>
                      ) : null}
                      {onDeleteSale ? (
                        <button type="button" className={`${styles.deleteButton} button-spacing-small`} onClick={() => openConfirm(sale.id)}>
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

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta venda?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => {
          if (selectedId !== null) {
            onDeleteSale?.(selectedId);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default SalesTable;
