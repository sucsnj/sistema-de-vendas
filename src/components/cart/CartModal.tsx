/**
 * src/components/ModalCarrinho.tsx
 *
 * Modal do carrinho de vendas. Apresentacional — sem estado próprio:
 * lógica fica no `useCart` (pai) e a casca visual no `CartModalShell`.
 * Estilos: classes globais `cart-modal-*` para o chrome e `<style jsx>`
 * local apenas para itens/quantidade/ações.
 * Ver docs/components/ModalCarrinho.md.
 */

import React, { useMemo } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatCurrency } from '../../utils/formatter';
import { getCartSummary } from '../../utils/cart';
import { CartModalShell } from './CartModalShell';
import type { CartItem } from '../../types/sale';

interface ModalCarrinhoProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, tipo: 'PRODUTO' | 'SERVICO', newQty: number) => void;
  onRemoveItem: (id: number, tipo: 'PRODUTO' | 'SERVICO') => void;
  onClearCart: () => void;
}

const ModalCarrinho: React.FC<ModalCarrinhoProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const summary = useMemo(() => getCartSummary(cartItems), [cartItems]);

  return (
    <CartModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Itens no Carrinho"
      titleId="cart-modal-title"
      icon={<ShoppingCartIcon className="cart-modal-icon" />}
      closeAriaLabel="Fechar modal de carrinho"
      summary={summary}
      footerLeft={
        cartItems.length > 0 ? (
          <button type="button" className="cart-clear-all-btn" onClick={onClearCart}>
            <DeleteIcon fontSize="small" />
            Limpar Carrinho
          </button>
        ) : undefined
      }
    >
      {cartItems.length === 0 ? (
        <div className="cart-modal-empty">
          <ShoppingCartIcon style={{ fontSize: '3rem', opacity: 0.3 }} />
          <p>Seu carrinho está vazio.</p>
          <span>Selecione produtos ou serviços no formulário para adicionar.</span>
        </div>
      ) : (
        <div className="cart-items-list">
          {cartItems.map((item, index) => {
            const subtotal = (item.preco_venda ?? 0) * item.quantidade;
            return (
              <div className="cart-item-row" key={`${item.tipo}-${item.id}-${index}`}>
                {/* Informações do Item */}
                <div className="cart-item-main">
                  <div className="cart-item-header">
                    <span className="cart-item-name">{item.nome}</span>
                    <span
                      className={`cart-badge-type ${
                        item.tipo === 'PRODUTO' ? 'badge-produto' : 'badge-servico'
                      }`}
                    >
                      {item.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                    </span>
                  </div>
                  <div className="cart-item-details">
                    {item.codigo_interno && (
                      <span className="cart-item-code">#{item.codigo_interno}</span>
                    )}
                    <span className="cart-item-unit-price">
                      {formatCurrency(item.preco_venda ?? 0, 2)} / un
                    </span>
                  </div>
                </div>

                {/* Controles de Quantidade, Subtotal e Remoção */}
                <div className="cart-item-actions">
                  <div className="cart-qty-control">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.tipo, item.quantidade - 1)}
                      title="Diminuir quantidade"
                      aria-label="Diminuir quantidade"
                    >
                      <RemoveIcon fontSize="inherit" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="qty-input"
                      value={item.quantidade}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          onUpdateQuantity(item.id, item.tipo, val);
                        }
                      }}
                      aria-label={`Quantidade de ${item.nome}`}
                    />
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.tipo, item.quantidade + 1)}
                      title="Aumentar quantidade"
                      aria-label="Aumentar quantidade"
                    >
                      <AddIcon fontSize="inherit" />
                    </button>
                  </div>

                  <div className="cart-item-subtotal-box">
                    <span className="subtotal-val">{formatCurrency(subtotal, 2)}</span>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => onRemoveItem(item.id, item.tipo)}
                    title="Remover item do carrinho"
                    aria-label={`Remover ${item.nome}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        /* Lista de Itens (chrome vem de src/styles/globals.css) */
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 8px;
        }

        .cart-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: var(--surface-soft, rgba(255, 255, 255, 0.04));
          border: 1px solid var(--border, #2a2a2a);
          border-radius: 12px;
          gap: 12px;
          transition: border-color 0.2s;
        }

        .cart-item-row:hover {
          border-color: var(--border, #444);
        }

        .cart-item-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .cart-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .cart-item-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--foreground);
          word-break: break-word;
        }

        .cart-item-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--muted);
        }

        .cart-badge-type {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge-produto {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .badge-servico {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .cart-qty-control {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          background: var(--background, #121212);
          border: 1px solid var(--border, #444);
          border-radius: 8px;
          padding: 2px;
          width: fit-content;
        }

        .qty-btn {
          background: transparent;
          border: none;
          color: var(--foreground);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 6px;
          font-size: 0.85rem;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
        }

        .qty-btn:hover {
          background: var(--surface-soft, rgba(255, 255, 255, 0.1));
          color: #3ed955;
        }

        .qty-input {
          width: 36px;
          text-align: center;
          background: transparent;
          border: none;
          color: var(--foreground);
          font-weight: 700;
          font-size: 0.9rem;
          outline: none;
          -moz-appearance: textfield;
        }

        .qty-input::-webkit-outer-spin-button,
        .qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .cart-item-subtotal-box {
          min-width: 80px;
          text-align: right;
        }

        .subtotal-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #3ed955;
        }

        .cart-remove-btn {
          background: transparent;
          border: none;
          color: var(--danger, #ef4444);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.1s;
        }

        .cart-remove-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          transform: scale(1.1);
        }

        .cart-clear-all-btn {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.2s, border-color 0.2s;
        }

        .cart-clear-all-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: #ef4444;
        }

        /* Responsividade p/ telas menores (<= 640px) */
        @media (max-width: 640px) {
          .cart-item-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 10px 12px;
          }

          .cart-item-actions {
            justify-content: space-between;
            width: 100%;
            padding-top: 8px;
            border-top: 1px dashed var(--border, #2a2a2a);
          }

          .cart-clear-all-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </CartModalShell>
  );
};

export default ModalCarrinho;
