import { useEffect, useState, useRef } from 'react';
import Toast from './Toast';
import { registrarVenda, VendaDiaria } from '../services/vendasService';
import { Parser } from 'expr-eval';
import { formatCurrency } from '../utils/formatter';
import parseNumber from '../utils/number';

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
  const [calculatedValue, setCalculatedValue] = useState<number | null>(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => {
    setToastOpen(false);
  };

  const calculateValue = (input: string) => {
    if (!input.trim()) {
      setCalculatedValue(0);
      return;
    }
    try {
      // Substituir vírgulas por pontos para cálculo
      let expression = input.replace(/,/g, '.');
      const parser = new Parser();
      let result = parser.evaluate(expression);
      if (typeof result === 'number' && !isNaN(result)) {
        setCalculatedValue(result);
        return;
      }
    } catch (error) {
      // Se erro, tentar remover o último operador
      try {
        let expression = input.replace(/,/g, '.');
        const lastChar = expression.slice(-1);
        if (/[+\-*/]$/.test(lastChar)) {
          expression = expression.slice(0, -1);
          const parser = new Parser();
          const result = parser.evaluate(expression);
          if (typeof result === 'number' && !isNaN(result)) {
            setCalculatedValue(result);
            return;
          }
        }
      } catch (innerError) {
        // Ignorar
      }
    }
    setCalculatedValue(null);
  };

  const recentSales = [...sales]
    .sort((a, b) => {
      const dateA = new Date(`${a.data}T00:00:00`).getTime();
      const dateB = new Date(`${b.data}T00:00:00`).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.id - a.id;
    })
    .slice(0, 4);

  // apagar se pressionar esc no teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCalculatedValue(0); // limpa o somatório
        event.preventDefault();
        setValor('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const valueToRegister = calculatedValue !== null ? calculatedValue : parseNumber(valor);
      if (isNaN(valueToRegister)) {
        showToast('Valor inválido.', 'error');
        setLoading(false);
        return;
      }
      await registrarVenda(
        selectedDate,
        valueToRegister,
        observacoes
      );

      if (formRef.current) {
        const top =
          formRef.current.getBoundingClientRect().top +
          window.scrollY -
          80;

        window.scrollTo({
          top,
          behavior: 'smooth',
        });
      }

      showToast(`Venda registrada com sucesso: R$ ${valueToRegister.toFixed(2)}`, 'success');
      setValor('');
      setObservacoes('');
      setCalculatedValue(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      valorInputRef.current?.focus();
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  const formRef = useRef<HTMLFormElement | null>(null);

  const addOperator = (operator: string) => {
    const novoValor = valor + operator;
    setValor(novoValor);
    calculateValue(novoValor);

    requestAnimationFrame(() => {
      valorInputRef.current?.focus();
    });
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="daily-sale-form">
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
              <div className="math-buttons">
                <button
                  type="button"
                  className="math-button"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={() => addOperator('+')}
                >
                  +
                </button>
                <button
                  type="button"
                  className="math-button"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={() => addOperator('-')}
                >
                  -
                </button>
                <button
                  type="button"
                  className="math-button"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={() => addOperator('*')}
                >
                  ×
                </button>
                <button
                  type="button"
                  className="math-button"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={() => addOperator('/')}
                >
                  ÷
                </button>
              </div>
            <label>
              Valor:
              <div className="flex-center-gap">
                <input
                  ref={valorInputRef}
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={valor}
                  onChange={(e) => {
                    setValor(e.target.value);
                    calculateValue(e.target.value);
                  }}
                  required
                  autoFocus
                  className="flex-grow-1"
                />
              </div>
                <span className="display-value">
                  {formatCurrency(calculatedValue ?? 0, 2)}
                </span>
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
          border: 1px solid var(--border);
          padding: 10px 12px;
          font-size: 1rem;
        }

        .sale-form-fields {
          min-height: 110px;
          resize: vertical;
        }

        .sale-form-fields button {
          width: fit-content;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: var(--accent);
          color: var(--foreground);
          font-weight: 700;
          cursor: pointer;
        }

        .sale-form-fields button:disabled {
          background: var(--muted);
          cursor: not-allowed;
        }

        .flex-center-gap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .flex-grow-1 {
          flex: 1;
        }

        .display-value {
          font-size: 1.9rem;
          font-weight: 700;
          min-width: 110px;
          text-align: right;
          margin-right: 10px;
        }

        .recent-history {
          padding: 16px;
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
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
          background: var(--surface-soft);
        }

        .recent-sale-observacoes {
          margin-top: 6px;
          color: var(--muted);
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
          background: var(--surface-soft);
        }

        .recent-sale-actions button:last-of-type {
          background: var(--danger);
          color: var(--foreground);
        }

        .math-buttons {
          display: none;
        }

        .math-button {
          padding: 6px 10px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
        }

        @media (max-width: 900px) {
          .sale-form-grid {
            grid-template-columns: 1fr;
          }

          .math-buttons {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default DailySaleForm;