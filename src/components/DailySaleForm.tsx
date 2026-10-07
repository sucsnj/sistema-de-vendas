import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { formatCurrency } from '../utils/formatter';
import { useDailySaleForm } from '../hooks/useDailySaleForm';
import type { VendaDiaria } from '../services/vendasService';
import ModalCarrinho from './ModalCarrinho';
import ModalPix from './ModalPix';
import ModalSelecionarItens from './ModalSelecionarItens';

interface DailySaleFormProps {
  sales?: VendaDiaria[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaleAdded?: () => void;
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
  showHistory?: boolean;
}

// Formulário de venda diária (dashboard `/`). Componente apresentacional:
// a lógica de estado/validação/ações vive em `useDailySaleForm`
// (ver docs/components/DailySaleForm.md e docs/hooks/Hooks.md).
const DailySaleForm: React.FC<DailySaleFormProps> = ({
  selectedDate,
  onDateChange,
  onSaleAdded,
}) => {
  const {
    value,
    observations,
    setObservations,
    loading,
    clearing,
    calculatedValue,
    pixModalOpen,
    setPixModalOpen,
    pixPayload,
    pixAmount,
    valueInputRef,
    observationsTextareaRef,
    formRef,
    handleKeyDown,
    handleValueChange,
    handlePixClick,
    handleSubmit,
    handleClear,
    addOperator,
    cartItems,
    cartSearch,
    setCartSearch,
    catalogItems,
    loadingCatalog,
    selecionarOpen,
    cartModalOpen,
    handleCartClick,
    closeSelecao,
    closeCarrinho,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount,
  } = useDailySaleForm({ selectedDate, onSaleAdded });

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="daily-sale-form">
        <h2>Registrar Venda Diária</h2>
        <div className="sale-form-grid">
          <div className="sale-form-fields">
            <label>
              {/* Data: */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="flex-grow-data"
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
                <span>+</span>
              </button>
              <button
                type="button"
                className="math-button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('-')}
              >
                <span>-</span>
              </button>
              <button
                type="button"
                className="math-button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('*')}
              >
                <span>×</span>
              </button>
              <button
                type="button"
                className="math-button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('/')}
              >
                <span>÷</span>
              </button>
            </div>
            <label>
              {/* Valor: */}
              <div className="input-with-icon-wrapper">
                <input
                  ref={valueInputRef}
                  type="text"
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={value}
                  onChange={handleValueChange}
                  autoFocus
                  className="flex-grow-valor"
                  placeholder={'Valor'}
                />
                <button
                  type="button"
                  className="cart-icon-button"
                  onClick={handleCartClick}
                  aria-label="Abrir carrinho"
                  title="Abrir carrinho"
                >
                  <AddShoppingCartIcon className="cart-icon" />
                  {totalCartCount > 0 && (
                    <span className="cart-badge">{totalCartCount}</span>
                  )}
                </button>
              </div>
              <span className="display-value">
                {/* botão para gerar qrcode pix */}
                <span className="pix-button" onClick={handlePixClick}>
                  <QrCode2Icon className="pix-icon" />
                </span>
                <span className="pix-button" onClick={handlePixClick}>
                  {formatCurrency(calculatedValue ?? 0, 2)}
                </span>
              </span>
            </label>
            <label>
              {/* Observações: */}
              <textarea
                value={observations}
                ref={observationsTextareaRef}
                onChange={(e) => setObservations(e.target.value)}
                className="flex-grow-observacoes"
                placeholder={'Observações...'}
              />
            </label>
            <div className="buttons-wrapper">
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
              <button
                type="button"
                className="clear-button"
                disabled={clearing}
                onClick={handleClear}
              >
                {clearing ? 'Limpando...' : 'Limpar'}
              </button>
            </div>
          </div>
        </div>
      </form>
      <ModalSelecionarItens
        isOpen={selecionarOpen}
        onClose={closeSelecao}
        onManageCart={handleManageCart}
        cartItems={cartItems}
        catalogItems={catalogItems}
        loadingCatalog={loadingCatalog}
        cartSearch={cartSearch}
        onCartSearchChange={setCartSearch}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />
      <ModalCarrinho
        isOpen={cartModalOpen}
        onClose={closeCarrinho}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
      <ModalPix
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
        payload={pixPayload}
        merchantName={process.env.NEXT_PUBLIC_PIX_NAME ?? ''}
        merchantBank={process.env.NEXT_PUBLIC_PIX_BANK ?? ''}
        amount={pixAmount}
        pixKey={process.env.NEXT_PUBLIC_PIX_KEY ?? ''}
      />
      <style jsx>{`
        .daily-sale-form {
          position: relative;
        }

        .sale-form-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.1fr;
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

        .input-with-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .input-with-icon-wrapper input {
          width: 100%;
          padding-right: 44px;
        }

        .sale-form-fields button.cart-icon-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 6px;
          margin: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--muted);
          border-radius: 8px;
          width: auto;
          min-width: unset;
          transition: color 0.2s ease, background-color 0.2s ease;
          color: #3ed955ff;
        }

        .sale-form-fields button.cart-icon-button:hover {
          color: var(--accent);
          background-color: var(--surface-soft, rgba(255, 255, 255, 0.08));
        }

        .cart-icon {
          font-size: 1.3rem;
        }

        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #3ed955;
          color: #000;
          font-size: 0.65rem;
          font-weight: 800;
          border-radius: 999px;
          min-width: 17px;
          height: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
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

          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        /* estilo para deixar o botão clicável visualmente amigável */
        .pix-button {
          cursor: pointer;
          width: fit-content;
          height: fit-content;
          display: inline-flex;
          align-items: center;
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

          .display-value {
            font-size: 3.0rem;
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