import { FormEvent, useState, useEffect, useRef } from "react";
import { buscarVendaItens, atualizarVenda, VendaDiaria, VendaItemData } from "../services/vendasService";
import { buscarProdutos, buscarServicos, ItemData, ServicoData } from "../services/produtosService";
import ModalCarrinho from "./ModalCarrinho";
import { CartItem } from "./DailySaleForm";
import parseNumber from "../utils/number";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface EditSaleFormProps {
  sale: VendaDiaria;
  onSaved: () => void;
  onCancel: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

const EditSaleForm: React.FC<EditSaleFormProps> = ({ sale, onSaved, onCancel, onToast }) => {
  const [editData, setEditData] = useState(sale.data);
  const [editValor, setEditValor] = useState(sale.valor.toFixed(2));
  const [editObservacoes, setEditObservacoes] = useState(sale.observacoes ?? "");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [loadingItens, setLoadingItens] = useState(true);
  const [catalogItems, setCatalogItems] = useState<ItemData[]>([]);
  const [cartSearch, setCartSearch] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const cartDropdownRef = useRef<HTMLDivElement | null>(null);
  const cartSearchInputRef = useRef<HTMLInputElement | null>(null);
  const editValorInputRef = useRef<HTMLInputElement | null>(null);

  // Carrega os itens existentes da venda ao abrir o form
  useEffect(() => {
    const load = async () => {
      setLoadingItens(true);
      const itens: VendaItemData[] = await buscarVendaItens(sale.id);
      setCartItems(
        itens.map((item) => ({
          id: item.item_id ?? item.id,
          tipo: item.tipo,
          nome: item.nome,
          preco_venda: item.preco_unitario,
          quantidade: item.quantidade,
          codigo_interno: item.codigo_interno ?? undefined,
          referencia: item.referencia ?? undefined,
        }))
      );
      setLoadingItens(false);
    };
    load();
  }, [sale.id]);

  // Recalcula o valor total quando os itens do carrinho mudam
  useEffect(() => {
    if (cartItems.length === 0) return;
    const total = cartItems.reduce((acc, item) => acc + (item.preco_venda ?? 0) * item.quantidade, 0);
    setEditValor(total.toFixed(2));
  }, [cartItems]);

  // Foca no input de valor ao abrir
  useEffect(() => {
    editValorInputRef.current?.focus();
    editValorInputRef.current?.select();
  }, []);

  // Busca catálogo para adicionar itens
  const buscarItensCatalogo = async (query: string) => {
    setLoadingCatalog(true);
    try {
      const [produtosData, servicosData] = await Promise.all([
        buscarProdutos({ search: query || undefined, ativo: "ATIVO", page: 1, pageSize: 50 }),
        buscarServicos({ search: query || undefined, page: 1, pageSize: 50 }),
      ]);

      const produtos = produtosData?.items || [];
      const servicos: ItemData[] = (servicosData?.items || []).map((servico: ServicoData) => ({
        id: servico.id,
        tipo: "SERVICO",
        nome: servico.nome,
        descricao: servico.descricao,
        categoria_id: servico.categoria_id,
        unidade_medida_id: 21,
        marca_id: 1,
        fornecedor_id: 1,
        preco_compra: 0,
        margem_lucro: 0,
        preco_venda: servico.preco_venda,
        estoque: 0,
        multiplicador_unidade: 1,
        estoque_total: 0,
        codigo_interno: servico.codigo_interno,
        referencia: servico.referencia || "",
        duracao_minutos: servico.duracao_minutos,
        data_criacao: servico.data_criacao,
        data_atualizacao: servico.data_atualizacao,
        categoria_nome: servico.categoria_nome,
      }));

      const catalogo = [...produtos, ...servicos].sort((a, b) => a.nome.localeCompare(b.nome));
      setCatalogItems(catalogo);
    } catch (error) {
      console.error("Erro ao buscar catálogo:", error);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    if (cartModalOpen) {
      const timer = setTimeout(() => buscarItensCatalogo(cartSearch), 250);
      return () => clearTimeout(timer);
    }
  }, [cartModalOpen, cartSearch]);

  const handleAddToCart = (item: ItemData) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === item.id && ci.tipo === item.tipo);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantidade: updated[existingIndex].quantidade + 1 };
        return updated;
      }
      return [
        ...prev,
        {
          id: item.id,
          tipo: item.tipo,
          nome: item.nome,
          preco_venda: item.preco_venda,
          quantidade: 1,
          codigo_interno: item.codigo_interno,
          referencia: item.referencia,
          estoque: item.estoque,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id: number, tipo: "PRODUTO" | "SERVICO", newQty: number) => {
    setCartItems((prev) => {
      if (newQty <= 0) return prev.filter((ci) => !(ci.id === id && ci.tipo === tipo));
      return prev.map((ci) => (ci.id === id && ci.tipo === tipo ? { ...ci, quantidade: newQty } : ci));
    });
  };

  const handleRemoveItem = (id: number, tipo: "PRODUTO" | "SERVICO") => {
    setCartItems((prev) => prev.filter((ci) => !(ci.id === id && ci.tipo === tipo)));
  };

  const handleClearCart = () => setCartItems([]);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantidade, 0);

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();

    const valor = parseNumber(editValor);

    try {
      await atualizarVenda(
        sale.id,
        editData,
        valor,
        editObservacoes,
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
            value={editData}
            onChange={(e) => setEditData(e.target.value)}
            required
          />
        </label>

        <label>
          Valor:
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              ref={editValorInputRef}
              type="number"
              step="0.01"
              value={editValor}
              onChange={(e) => setEditValor(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="cart-icon-button"
              onClick={() => setCartModalOpen(true)}
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
          {loadingItens && (
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px", display: "block" }}>
              Carregando itens...
            </span>
          )}
        </label>

        <label>
          Observações:
          <textarea
            className="flex-grow-edit-observacoes"
            value={editObservacoes}
            onChange={(e) => setEditObservacoes(e.target.value)}
          />
        </label>

        <button className="button-edit" type="submit">Salvar Alteração</button>
        <button type="button" onClick={onCancel} className="button-spacing button-delete">
          Cancelar
        </button>
      </form>

      {/* Modal de carrinho para adicionar/editar itens */}
      <ModalCarrinho
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </>
  );
};

export default EditSaleForm;
