import { FormEvent, useState, useEffect, useRef } from "react";
import { fetchSaleItems, updateSale, DailySale, SaleItemData } from "../../services/vendasService";
import CartModal from "@/components/cart/CartModal";
import SelectItemsModal from "@/components/cart/SelectItemsModal";
import { useCart } from "../../hooks/useCart";
import parseNumber from "../../utils/number";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

interface EditSaleFormProps {
  sale: DailySale;
  onSaved: () => void;
  onCancel: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

const EditSaleForm: React.FC<EditSaleFormProps> = ({ sale, onSaved, onCancel, onToast }) => {
  const [editDate, setEditDate] = useState(sale.data);
  const [editAmount, setEditAmount] = useState(sale.valor.toFixed(2));
  const [editNotes, setEditNotes] = useState(sale.observacoes ?? "");
  const [loadingItems, setLoadingItems] = useState(true);
  const editAmountInputRef = useRef<HTMLInputElement | null>(null);

  // Estado e ações do carrinho (catálogo, seleção e gerenciamento), compartilhado
  // com o formulário de registrar venda através do hook useCart
  const {
    cartItems,
    setCartItems,
    cartSearch,
    setCartSearch,
    catalogItems,
    loadingCatalog,
    selectModalOpen,
    cartModalOpen,
    handleCartClick,
    closeSelectModal,
    openCartModal,
    closeCartModal,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount,
  } = useCart(onToast);

  // Carrega os itens existentes da venda ao abrir o form
  useEffect(() => {
    const load = async () => {
      setLoadingItems(true);
      const items: SaleItemData[] = await fetchSaleItems(sale.id);
      setCartItems(
        items.map((item) => ({
          id: item.item_id ?? item.id,
          tipo: item.tipo,
          nome: item.nome,
          preco_venda: item.preco_unitario,
          quantidade: item.quantidade,
          codigo_interno: item.codigo_interno ?? undefined,
          referencia: item.referencia ?? undefined,
        }))
      );
      setLoadingItems(false);
    };
    load();
  }, [sale.id, setCartItems]);

  // Recalcula o valor total quando os itens do carrinho mudam
  // (padrão React de ajustar estado durante a renderização, preservando
  // o campo quando o carrinho fica vazio)
  const [prevCartItems, setPrevCartItems] = useState(cartItems);
  if (cartItems !== prevCartItems) {
    setPrevCartItems(cartItems);
    if (cartItems.length > 0) {
      const total = cartItems.reduce((acc, item) => acc + (item.preco_venda ?? 0) * item.quantidade, 0);
      setEditAmount(total.toFixed(2));
    }
  }

  // Foca no input de valor ao abrir
  useEffect(() => {
    editAmountInputRef.current?.focus();
    editAmountInputRef.current?.select();
  }, []);

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();

    const amount = parseNumber(editAmount);

    try {
      await updateSale(
        sale.id,
        editDate,
        amount,
        editNotes,
        cartItems.map((item) => ({
          item_id: item.id,
          tipo: item.tipo,
          nome: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.preco_venda,
          codigo_interno: item.codigo_interno ?? null,
          referencia: item.referencia ?? null,
        }))
      );
      onToast("Venda atualizada com sucesso.", "success");
      onSaved();
    } catch {
      onToast("Erro ao salvar alteração.", "error");
    }
  };

  return (
    <>
      <form onSubmit={handleSaveEdit} className="glass-form">
        <h2>Editar Venda</h2>

        <label>
          Data:
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            required
          />
        </label>

        <label>
          Valor:
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}
          className="input-with-icon-wrapper"
          >
            <input
              ref={editAmountInputRef}
              type="number"
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
              style={{ flex: 1 }}
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
            <button
              type="button"
              className="cart-icon-button"
              onClick={openCartModal}
              aria-label="Editar itens da venda"
              title="Editar itens da venda"
            >
              <ShoppingCartIcon className="cart-icon" />
              {totalCartCount > 0 && (
                <span className="cart-badge">{totalCartCount}</span>
              )}
            </button>
          </div>
          {cartItems.length > 0 && (
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px", display: "block" }}>
              {cartItems.length} {cartItems.length === 1 ? "item" : "itens"} no carrinho — valor recalculado automaticamente
            </span>
          )}
          {loadingItems && (
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px", display: "block" }}>
              Carregando itens...
            </span>
          )}
        </label>

        <label>
          Observações:
          <textarea
            className="flex-grow-edit-observacoes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />
        </label>

        <button className="button-edit" type="submit">Salvar Alteração</button>
        <button type="button" onClick={onCancel} className="button-spacing button-delete">
          Cancelar
        </button>
      </form>

      {/* Modal de seleção de itens (adicionar ao carrinho) */}
      <SelectItemsModal
        isOpen={selectModalOpen}
        onClose={closeSelectModal}
        onManageCart={handleManageCart}
        cartItems={cartItems}
        catalogItems={catalogItems}
        loadingCatalog={loadingCatalog}
        cartSearch={cartSearch}
        onCartSearchChange={setCartSearch}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />

      {/* Modal de carrinho para editar itens */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={closeCartModal}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </>
  );
};

export default EditSaleForm;