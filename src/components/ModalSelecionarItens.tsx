/**
 * src/components/ModalSelecionarItens.tsx
 *
 * Modal de seleção de itens do catálogo. Apresentacional — sem estado
 * próprio (busca/soma vêm do `useCart` via props) e com a casca visual
 * compartilhada no `CartModalShell`. Ver docs/components/ModalSelecionarItens.md.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { formatCurrency } from '../utils/formatter';
import { getCartSummary } from '../utils/cart';
import { CartModalShell } from './CartModalShell';
import { ItemData } from '../services/produtosService';
import type { CartItem } from '../types/sale';

interface ModalSelecionarItensProps {
  isOpen: boolean;
  onClose: () => void;
  onManageCart: () => void;
  cartItems: CartItem[];
  catalogItems: ItemData[];
  loadingCatalog: boolean;
  cartSearch: string;
  onCartSearchChange: (value: string) => void;
  onAddToCart: (item: ItemData) => void;
  onRemoveFromCart: (item: ItemData) => void;
}

const ModalSelecionarItens: React.FC<ModalSelecionarItensProps> = ({
  isOpen,
  onClose,
  onManageCart,
  cartItems,
  catalogItems,
  loadingCatalog,
  cartSearch,
  onCartSearchChange,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Foco automático na busca ao abrir a janela
  useEffect(() => {
    if (isOpen) {
      const timeoutId = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const summary = useMemo(() => getCartSummary(cartItems), [cartItems]);

  return (
    <CartModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Itens"
      titleId="cart-select-title"
      icon={<AddShoppingCartIcon className="cart-modal-icon" />}
      closeAriaLabel="Fechar janela de seleção de itens"
      summary={summary}
      footerLeft={
        summary.totalItems > 0 ? (
          <button type="button" className="cart-manage-btn" onClick={onManageCart}>
            <ShoppingCartIcon style={{ fontSize: '1rem' }} />
            Gerenciar
          </button>
        ) : undefined
      }
    >
      {/* Corpo com busca e catálogo */}
      <div className="cart-catalog-search">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar produto ou serviço..."
          value={cartSearch}
          onChange={(e) => onCartSearchChange(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          className="cart-search-input"
        />
        {cartSearch && (
          <button
            type="button"
            className="cart-search-clear"
            onClick={() => onCartSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>

      <div className="cart-catalog-list">
        {loadingCatalog ? (
          <div className="cart-catalog-empty">Buscando itens...</div>
        ) : catalogItems.length === 0 ? (
          <div className="cart-catalog-empty">Nenhum produto ou serviço encontrado</div>
        ) : (
          catalogItems.map((item) => {
            const inCart = cartItems.find((ci) => ci.id === item.id && ci.tipo === item.tipo);
            const hasInCart = Boolean(inCart && inCart.quantidade > 0);
            return (
              <div key={`${item.tipo}-${item.id}`} className="cart-catalog-item-row">
                <button
                  type="button"
                  className={`cart-btn-sub ${!hasInCart ? 'disabled' : ''}`}
                  disabled={!hasInCart}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item);
                  }}
                  title={hasInCart ? 'Subtrair 1 unidade' : 'Item não está no carrinho'}
                  aria-label="Subtrair 1 unidade"
                >
                  -
                </button>

                <div className="cart-catalog-item" onClick={() => onAddToCart(item)}>
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.nome}</span>
                    <div className="cart-item-meta">
                      <span className={`cart-type-badge ${item.tipo.toLowerCase()}`}>
                        {item.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                      </span>
                      {item.tipo === 'PRODUTO' && item.estoque !== undefined && (
                        <span className="cart-item-stock">Est: {item.estoque}</span>
                      )}
                      {item.codigo_interno && (
                        <span className="cart-item-code">#{item.codigo_interno}</span>
                      )}
                    </div>
                  </div>
                  <div className="cart-item-price-section">
                    <span className="cart-item-price">
                      {formatCurrency(item.preco_venda ?? 0, 2)}
                    </span>
                    {hasInCart && (
                      <span className="cart-item-qty-badge">+{inCart?.quantidade}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .cart-catalog-search {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .cart-catalog-search input.cart-search-input {
          width: 100%;
          padding: 10px 36px 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .cart-catalog-search input.cart-search-input:focus {
          border-color: var(--accent);
        }

        .cart-catalog-search button.cart-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 4px;
          width: auto;
          color: var(--muted);
          font-size: 0.8rem;
          cursor: pointer;
          border-radius: 4px;
        }

        .cart-catalog-search button.cart-search-clear:hover {
          color: var(--foreground);
        }

        .cart-catalog-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-bottom: 8px;
        }

        .cart-catalog-item-row {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
        }

        button.cart-btn-sub {
          width: 28px;
          height: 28px;
          min-width: 28px;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid var(--border, #444);
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, opacity 0.2s;
          flex-shrink: 0;
        }

        button.cart-btn-sub:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
          transform: scale(1.05);
        }

        button.cart-btn-sub:disabled,
        button.cart-btn-sub.disabled {
          opacity: 0.15;
          background: transparent;
          color: var(--muted);
          border-color: transparent;
          cursor: not-allowed;
          transform: none;
        }

        .cart-catalog-item-row .cart-catalog-item {
          flex: 1;
        }

        .cart-catalog-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          background: var(--surface-soft, rgba(255, 255, 255, 0.04));
          border: 1px solid var(--border, #2a2a2a);
          gap: 8px;
        }

        .cart-catalog-item:hover {
          background: var(--surface-soft, rgba(255, 255, 255, 0.08));
          border-color: var(--border, #444);
        }

        .cart-item-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          text-align: left;
          min-width: 0;
          flex: 1;
        }

        .cart-item-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--foreground);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--muted);
          flex-wrap: wrap;
        }

        .cart-type-badge {
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .cart-type-badge.produto {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .cart-type-badge.servico {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .cart-item-stock,
        .cart-item-code {
          font-size: 0.75rem;
          color: var(--muted);
        }

        .cart-item-price-section {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .cart-item-price {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--foreground);
        }

        .cart-item-qty-badge {
          background: #3ed955;
          color: #000;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 2px 7px;
          border-radius: 10px;
        }

        .cart-catalog-empty {
          padding: 24px;
          text-align: center;
          color: var(--muted);
          font-size: 0.85rem;
        }

        button.cart-manage-btn {
          width: auto;
          min-width: unset;
          padding: 8px 14px;
          margin: 0;
          border-radius: 8px;
          background: #3ed955;
          color: #000;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s, transform 0.1s;
        }

        button.cart-manage-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>
    </CartModalShell>
  );
};

export default ModalSelecionarItens;