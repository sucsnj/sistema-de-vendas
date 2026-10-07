# `src/components/ModalSelecionarItens.tsx`

## Descrição

Modal de **seleção de itens do catálogo** (produtos + serviços) para adicionar ao carrinho: campo de busca com foco automático, lista de resultados com botão "−" (subtrair) e badge "+N" quando o item já está no carrinho. Apresentacional — toda a lógica (busca do catálogo, soma, modais) vem do `useCart` via props.

## Contexto

Aberto por `DailySaleForm`/`EditSaleForm` via `useCart` (`handleCartClick` → `selecionarOpen`). Ao selecionar um item, o carrinho recebe +1 unidade (agrupado por `id + tipo`). O botão "Gerenciar" (rodapé) fecha a seleção e abre o `ModalCarrinho` (`handleManageCart`).

## Assinatura

```ts
interface ModalSelecionarItensProps {
  isOpen: boolean;
  onClose: () => void;
  onManageCart: () => void;
  cartItems: CartItem[];
  catalogItems: ItemData[];      // src/services/produtosService
  loadingCatalog: boolean;
  cartSearch: string;
  onCartSearchChange: (value: string) => void;
  onAddToCart: (item: ItemData) => void;
  onRemoveFromCart: (item: ItemData) => void;
}

const ModalSelecionarItens: React.FC<ModalSelecionarItensProps>;
```

## Comportamento

- **Foco automático** no campo de busca ao abrir (timeout 50ms — preservado da implementação original).
- Busca do catálogo é de responsabilidade do `useCart` (debounce 250ms); este modal apenas renderiza `catalogItems`/`loadingCatalog`.
- Cada linha: botão "−" (subtrai 1, habilitado apenas se o item está no carrinho com quantidade > 0), clique no item adiciona +1.
- Badges por tipo (`cart-type-badge produto/servico`), estoque (produtos) e código interno.

## Dependências

- `CartModalShell` (casca compartilhada; chrome, ESC, focus-trap, totais).
- `getCartSummary` (`src/utils/cart`) — badge de contagem e total.
- `ItemData` (`src/services/produtosService`), `CartItem` (`src/types/sale.ts`).
- `<style jsx>` local apenas para busca/catálogo; chrome usa classes globais `cart-modal-*`.

## Observações

- Adiciona **1 unidade** por clique (comportamento original); para quantidades maiores usa-se o `ModalCarrinho`.
- Foi extraído da duplicação de chrome na refatoração: os totais antes eram recalculados com `reduce` no próprio componente (agora via `getCartSummary`).