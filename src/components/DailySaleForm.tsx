import { useEffect, useState, useRef } from 'react';
import Toast from './Toast';
import { registrarVenda, VendaDiaria } from '../services/vendasService';
import { Parser } from 'expr-eval';
import { formatCurrency } from '../utils/formatter';
import { validateCurrency, validateDate } from '../utils/validation';
import { useShortcuts } from '../utils/shortcuts';
import { highlightField } from '../utils/forms';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { buscarProdutos, buscarServicos, ItemData, ServicoData } from '../services/produtosService';
import ModalCarrinho from './ModalCarrinho';

export interface CartItem {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  preco_venda: number;
  quantidade: number;
  codigo_interno?: string;
  referencia?: string;
  estoque?: number;
}

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
  const [limpando, setLimpando] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastOpen, setToastOpen] = useState(false);
  const valorInputRef = useRef<HTMLInputElement | null>(null);
  const observacoesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [calculatedValue, setCalculatedValue] = useState<number | null>(0);

  // Exibe mensagem de sucesso, erro ou informação
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => {
    setToastOpen(false);
  };

  const [cartOpen, setCartOpen] = useState(false);
  const [cartSearch, setCartSearch] = useState('');
  const [catalogItems, setCatalogItems] = useState<ItemData[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartDropdownRef = useRef<HTMLDivElement | null>(null);
  const cartSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Função para buscar produtos e serviços para o carrinho
  const buscarItensCatalogo = async (query: string) => {
    setLoadingCatalog(true);
    try {
      const [produtosData, servicosData] = await Promise.all([
        buscarProdutos({
          search: query || undefined,
          ativo: 'ATIVO',
          page: 1,
          pageSize: 50,
        }),
        buscarServicos({
          search: query || undefined,
          page: 1,
          pageSize: 50,
        }),
      ]);

      const produtos = produtosData?.items || [];
      const servicos: ItemData[] = (servicosData?.items || []).map((servico: ServicoData) => ({
        id: servico.id,
        tipo: 'SERVICO',
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
        referencia: servico.referencia || '',
        duracao_minutos: servico.duracao_minutos,
        data_criacao: servico.data_criacao,
        data_atualizacao: servico.data_atualizacao,
        categoria_nome: servico.categoria_nome,
      }));

      const catalogo = [...produtos, ...servicos].sort((a, b) => a.nome.localeCompare(b.nome));
      setCatalogItems(catalogo);
    } catch (error) {
      console.error('Erro ao buscar catálogo para o carrinho:', error);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Carrega catálogo ao abrir o carrinho ou mudar busca
  useEffect(() => {
    if (cartOpen) {
      const timer = setTimeout(() => {
        buscarItensCatalogo(cartSearch);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [cartOpen, cartSearch]);

  // Foco no input de busca ao abrir o dropdown
  useEffect(() => {
    if (cartOpen) {
      setTimeout(() => {
        cartSearchInputRef.current?.focus();
      }, 50);
    }
  }, [cartOpen]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target as Node)
      ) {
        setCartOpen(false);
      }
    };
    if (cartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartOpen]);

  // Função para lidar com o clique no botão do carrinho
  const handleCartClick = () => {
    setCartOpen((prev) => !prev);
  };

  // Adiciona +1 do produto/serviço ao carrinho
  const handleAddToCart = (item: ItemData) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (ci) => ci.id === item.id && ci.tipo === item.tipo
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantidade: updated[existingIndex].quantidade + 1,
        };
        return updated;
      } else {
        return [
          ...prevItems,
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
      }
    });
    showToast(`+1 "${item.nome}" adicionado ao carrinho!`, 'success');
  };

  // Subtrai 1 unidade do item no carrinho
  const handleRemoveFromCart = (item: ItemData) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (ci) => ci.id === item.id && ci.tipo === item.tipo
      );
      if (existingIndex === -1) return prevItems;

      if (prevItems[existingIndex].quantidade <= 1) {
        return prevItems.filter((_, idx) => idx !== existingIndex);
      } else {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantidade: updated[existingIndex].quantidade - 1,
        };
        return updated;
      }
    });
    showToast(`-1 "${item.nome}" removido do carrinho.`, 'info');
  };

  // Atualiza quantidade no modal
  const handleUpdateQuantity = (id: number, tipo: 'PRODUTO' | 'SERVICO', newQty: number) => {
    setCartItems((prevItems) => {
      if (newQty <= 0) {
        return prevItems.filter((ci) => !(ci.id === id && ci.tipo === tipo));
      }
      return prevItems.map((ci) => {
        if (ci.id === id && ci.tipo === tipo) {
          return { ...ci, quantidade: newQty };
        }
        return ci;
      });
    });
  };

  // Remove item completo do carrinho
  const handleRemoveItem = (id: number, tipo: 'PRODUTO' | 'SERVICO') => {
    setCartItems((prevItems) =>
      prevItems.filter((ci) => !(ci.id === id && ci.tipo === tipo))
    );
    showToast('Item removido do carrinho.', 'info');
  };

  // Limpa todos os itens do carrinho
  const handleClearCart = () => {
    setCartItems([]);
    showToast('Carrinho limpo.', 'info');
  };

  const [cartModalOpen, setCartModalOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantidade, 0);
  const totalCartValue = cartItems.reduce(
    (acc, curr) => acc + (curr.preco_venda ?? 0) * curr.quantidade,
    0
  );

  // Constante com as teclas permitidas para o input de valor
  const allowedKeys = [
    "Backspace", "Delete", "Enter", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
  ];

  // Quando uma tecla é pressionada no input de valor, verifica se é permitida
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, currentTarget } = event;

    // Teclas permitidas: números, operadores matemáticos, parênteses, vírgula e ponto
    if (allowedKeys.includes(key)) return;
    if (/^[0-9]$/.test(key)) return;
    if (["+", "-", "*", "/", "(", ")", ".", ","].includes(key)) {
      const value = currentTarget.value;
      const lastChar = value.slice(-1);

      // Bloquear duplicação do mesmo símbolo
      if (lastChar === key) {
        event.preventDefault();
        return;
      }

      // Bloquear dois operadores diferentes seguidos (ex: "+*")
      if (/[+\-*/.,]/.test(lastChar) && /[+\-*/.,]/.test(key)) {
        event.preventDefault();
        return;
      }
      return;
    };

    // Bloquear qualquer outro caractere
    event.preventDefault();
  };

  // Calcula o valor do campo de valor
  const calculateValue = (input: string) => {
    if (!input.trim()) {
      setCalculatedValue(0);
      return;
    }
    try {
      // Substituir vírgulas por pontos para cálculo
      const expression = input.replace(/,/g, '.');
      const parser = new Parser();
      const result = parser.evaluate(expression);
      if (typeof result === 'number' && !isNaN(result)) {
        setCalculatedValue(result);
        return;
      }
    } catch (_error) {
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
      } catch (_innerError) {
        // Ignorar
      }
    }
    setCalculatedValue(null);
  };

  // apagar se pressionar esc no teclado
  useShortcuts(['Escape'], () => {
    setCalculatedValue(0); // limpa o somatório
    setValor('');
  });

  // botão para limpar valor e observações
  const handleClear = () => {
    setValor('');
    setObservacoes('');
    setCalculatedValue(0);
    // manda o foco para o input de valor
    valorInputRef.current?.focus();
  };

  // envia dados para o serviço de vendas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar data e valor antes de enviar
      const dateOk = validateDate(selectedDate);
      const valueFromInput = calculatedValue !== null ? calculatedValue : validateCurrency(valor);
      if (!dateOk) {
        showToast('Data inválida.', 'error');
        setLoading(false);
        return;
      }

      // Toast para o campo valor vazio
      if (!valor.trim()) {
        showToast('Informe o valor da venda.', 'error');
        highlightField(valorInputRef);
        setLoading(false);
        valorInputRef.current?.focus();
        return;
      }

      // Toast para o campo valor inválido
      if (valueFromInput == null) {
        highlightField(valorInputRef);
        showToast('Valor inválido.', 'error');
        setLoading(false);
        return;
      }

      // Se for 0 ou menos, pede o preenchimento do campo de observações
      if (observacoes.trim() === '' && valueFromInput <= 0) {
        showToast('Informe o motivo da venda.', 'info');
        highlightField(observacoesTextareaRef);
        setLoading(false);
        return;
      }

      // Registra a venda
      await registrarVenda(
        selectedDate,
        valueFromInput,
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

      showToast(`Venda registrada com sucesso: R$ ${valueFromInput.toFixed(2)}`, 'success');
      setValor('');
      setObservacoes('');
      setCalculatedValue(0);
      valorInputRef.current?.focus();
      valorInputRef.current?.select();
      if (onSaleAdded) {
        onSaleAdded();
      }
    } catch (_error) {
      showToast('Erro ao registrar venda.', 'error');
    }
    setLoading(false);
  };

  // Trata de manter o input de valor visível a cada 3 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const input = valorInputRef.current;
      if (input) {
        const rect = input.getBoundingClientRect();

        const estaVisivel =
          rect.top >= 70 && // distancia do topo
          rect.bottom <= window.innerHeight;

        if (!estaVisivel) {
          input?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          valorInputRef.current?.focus({ preventScroll: true });
        }
      }
    }, 180000); // 3 minutos

    return () => clearInterval(interval);
  }, []);

  // Trás o foco para o input de venda a cada 1 minuto
  useEffect(() => {
    const interval = setInterval(() => {
      valorInputRef.current?.focus();
    }, 60000); // 1 minuto
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
              {/* Data:  */}
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
              <div className="input-with-icon-wrapper" ref={cartDropdownRef}>
                <input
                  ref={valorInputRef}
                  type="text"
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={valor}
                  onChange={(e) => {
                    // Limpa o input em caso de caracteres inválidos
                    const value = e.target.value.replace(/[^0-9+\-*/(),.]/g, "");
                    e.target.value = value;
                    setValor(e.target.value);
                    calculateValue(e.target.value);
                  }}
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

                {cartOpen && (
                  <div className="cart-dropdown">
                    <div className="cart-dropdown-search">
                      <input
                        ref={cartSearchInputRef}
                        type="text"
                        placeholder="Buscar produto ou serviço..."
                        value={cartSearch}
                        onChange={(e) => setCartSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="cart-search-input"
                      />
                      {cartSearch && (
                        <button
                          type="button"
                          className="cart-search-clear"
                          onClick={() => setCartSearch('')}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="cart-dropdown-list">
                      {loadingCatalog ? (
                        <div className="cart-dropdown-empty">Buscando itens...</div>
                      ) : catalogItems.length === 0 ? (
                        <div className="cart-dropdown-empty">Nenhum produto ou serviço encontrado</div>
                      ) : (
                        catalogItems.map((item) => {
                          const inCart = cartItems.find(
                            (ci) => ci.id === item.id && ci.tipo === item.tipo
                          );
                          const hasInCart = Boolean(inCart && inCart.quantidade > 0);
                          return (
                            <div
                              key={`${item.tipo}-${item.id}`}
                              className="cart-dropdown-item-row"
                            >
                              <button
                                type="button"
                                className={`cart-btn-sub ${!hasInCart ? 'disabled' : ''}`}
                                disabled={!hasInCart}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromCart(item);
                                }}
                                title={hasInCart ? "Subtrair 1 unidade" : "Item não está no carrinho"}
                                aria-label="Subtrair 1 unidade"
                              >
                                -
                              </button>

                              <div
                                className="cart-dropdown-item"
                                onClick={() => handleAddToCart(item)}
                              >
                                <div className="cart-item-info">
                                  <span className="cart-item-name">{item.nome}</span>
                                  <div className="cart-item-meta">
                                    <span className={`cart-type-badge ${item.tipo.toLowerCase()}`}>
                                      {item.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                                    </span>
                                    {item.tipo === 'PRODUTO' && item.estoque !== undefined && (
                                      <span className="cart-item-stock">
                                        Est: {item.estoque}
                                      </span>
                                    )}
                                    {item.codigo_interno && (
                                      <span className="cart-item-code">
                                        #{item.codigo_interno}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="cart-item-price-section">
                                  <span className="cart-item-price">
                                    {formatCurrency(item.preco_venda ?? 0, 2)}
                                  </span>
                                  {hasInCart && (
                                    <span className="cart-item-qty-badge">
                                      +{inCart?.quantidade}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {cartItems.length > 0 && (
                      <div className="cart-dropdown-footer">
                        <div className="cart-footer-info">
                          <span>{totalCartCount} item(ns) no carrinho</span>
                          <span className="cart-footer-total">{formatCurrency(totalCartValue, 2)}</span>
                        </div>
                        <button
                          type="button"
                          className="cart-manage-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCartModalOpen(true);
                          }}
                        >
                          <ShoppingCartIcon style={{ fontSize: '1rem' }} />
                          Gerenciar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="display-value">
                {formatCurrency(calculatedValue ?? 0, 2)}
              </span>
            </label>
            <label>
              {/* Observações: */}
              <textarea
                value={observacoes}
                ref={observacoesTextareaRef}
                onChange={(e) => setObservacoes(e.target.value)}
                className="flex-grow-observacoes"
                placeholder={'Observações...'}
              />
            </label>
            <div className="buttons-wrapper">
              <button
                type="submit"
                className='register-button'
                disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
              <button
                type="button"
                className='clear-button'
                disabled={limpando}
                onClick={handleClear}>
                {limpando ? 'Limpando...' : 'Limpar'}
              </button>
            </div>
          </div>

        </div>
      </form>
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="local-top-right" />
      <ModalCarrinho
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
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

        .cart-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--surface, #1e1e1e);
          border: 1px solid var(--border, #333);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 380px;
        }

        .cart-dropdown-search {
          position: relative;
          display: flex;
          align-items: center;
          padding: 8px 10px;
          border-bottom: 1px solid var(--border, #333);
          background: var(--surface-soft, rgba(255, 255, 255, 0.03));
        }

        .sale-form-fields .cart-dropdown-search input.cart-search-input {
          width: 100%;
          padding: 8px 32px 8px 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-size: 0.85rem;
        }

        .sale-form-fields .cart-dropdown-search input.cart-search-input:focus {
          border-color: var(--accent);
          outline: none;
        }

        .sale-form-fields button.cart-search-clear {
          position: absolute;
          right: 18px;
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

        .sale-form-fields button.cart-search-clear:hover {
          color: var(--foreground);
          background: transparent;
        }

        .cart-dropdown-list {
          flex: 1;
          overflow-y: auto;
          max-height: 240px;
          min-height: 0;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          -webkit-overflow-scrolling: touch;
        }

        .cart-dropdown-item-row {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
        }

        .sale-form-fields button.cart-btn-sub {
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

        .sale-form-fields button.cart-btn-sub:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
          transform: scale(1.05);
        }

        .sale-form-fields button.cart-btn-sub:disabled,
        .sale-form-fields button.cart-btn-sub.disabled {
          opacity: 0.15;
          background: transparent;
          color: var(--muted);
          border-color: transparent;
          cursor: not-allowed;
          transform: none;
        }

        .cart-dropdown-item-row .cart-dropdown-item {
          flex: 1;
        }

        .cart-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          background: transparent;
          gap: 8px;
        }

        .cart-dropdown-item:hover {
          background: var(--surface-soft, rgba(255, 255, 255, 0.08));
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

        .cart-dropdown-empty {
          padding: 20px;
          text-align: center;
          color: var(--muted);
          font-size: 0.85rem;
        }

        .cart-dropdown-footer {
          padding: 8px 12px;
          border-top: 1px solid var(--border);
          background: var(--surface-soft, rgba(255, 255, 255, 0.02));
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .cart-footer-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .cart-footer-total {
          font-size: 0.9rem;
          font-weight: 700;
          color: #3ed955;
        }

        .sale-form-fields button.cart-manage-btn {
          width: auto;
          min-width: unset;
          padding: 6px 12px;
          margin: 0;
          border-radius: 8px;
          background: #3ed955;
          color: #000;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s, transform 0.1s;
        }

        .sale-form-fields button.cart-manage-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
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
