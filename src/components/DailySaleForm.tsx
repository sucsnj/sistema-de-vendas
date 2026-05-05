import { useState, useRef } from 'react';
import Toast from './Toast';
import { registrarVenda, VendaDiaria } from '../services/vendasService';

interface DailySaleFormProps {
  sales?: VendaDiaria[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaleAdded?: () => void;
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
  showHistory?: boolean;
}

const DailySaleForm: React.FC<DailySaleFormProps> = ({
  sales = [],
  selectedDate,
  onDateChange,
  onSaleAdded,
  onEditSale,
  onDeleteSale,
  showHistory = true,
}) => {
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastOpen, setToastOpen] = useState(false);
  const valorInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => {
    setToastOpen(false);
  };

  const recentSales = [...sales]
    .sort((a, b) => {
      const dateA = new Date(`${a.data}T00:00:00`).getTime();
      const dateB = new Date(`${b.data}T00:00:00`).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.id - a.id;
    })
    .slice(0, 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registrarVenda(selectedDate, parseFloat(valor), observacoes);
      showToast('Venda registrada com sucesso.', 'success');
      setValor('');
      setObservacoes('');
      valorInputRef.current?.focus();
      valorInputRef.current?.select();
      if (onSaleAdded) {
        onSaleAdded();
      }
    } catch (error) {
      showToast('Erro ao registrar venda.', 'error');
    }
    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="daily-sale-form">
        <h2>Registrar Venda Diária</h2>
        <div className="sale-form-grid">
          <div className="sale-form-fields">
            <label>
              Data:
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                required
              />
            </label>
            <label>
              Valor:
              <input
                ref={valorInputRef}
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </label>
            <label>
              Observações:
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>

          {showHistory ? (
            <div className="recent-history">
              <h3>Últimas 4 vendas</h3>
              {recentSales.length === 0 ? (
                <p>Nenhuma venda registrada ainda.</p>
              ) : (
                <ul>
                  {recentSales.map((sale) => (
                    <li key={sale.id} className="recent-sale-item">
                      <div>
                        <strong>{sale.data}</strong> • R$ {sale.valor.toFixed(2)}
                        <div className="recent-sale-observacoes">
                          {sale.observacoes || 'Sem observações'}
                        </div>
                      </div>
                      <div className="recent-sale-actions">
                        {onEditSale ? (
                          <button type="button" onClick={() => onEditSale(sale)}>
                            Editar
                          </button>
                        ) : null}
                        {onDeleteSale ? (
                          <button type="button" onClick={() => onDeleteSale(sale.id)}>
                            Excluir
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </form>
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="local-top-right" />
      <style jsx>{`
        .daily-sale-form {
          position: relative;
        }

        .sale-form-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          align-items: start;
          margin-top: 20px;
        }

        .sale-form-fields {
          display: grid;
          gap: 16px;
        }

        .sale-form-fields label,
        .recent-history {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sale-form-fields label input,
        .sale-form-fields label textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          padding: 10px 12px;
          font-size: 1rem;
        }

        .sale-form-fields textarea {
          min-height: 110px;
          resize: vertical;
        }

        .sale-form-fields button {
          width: fit-content;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: #1f7a5d;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .sale-form-fields button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .recent-history {
          padding: 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .recent-history h3 {
          margin: 0 0 12px;
          font-size: 18px;
        }

        .recent-history ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 12px;
        }

        .recent-sale-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #f8f9fb;
        }

        .recent-sale-observacoes {
          margin-top: 6px;
          color: #555;
          font-size: 0.95rem;
        }

        .recent-sale-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .recent-sale-actions button {
          padding: 8px 12px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        .recent-sale-actions button:first-of-type {
          background: #f2f2f2;
        }

        .recent-sale-actions button:last-of-type {
          background: #ff6b6b;
          color: white;
        }

        @media (max-width: 900px) {
          .sale-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default DailySaleForm;