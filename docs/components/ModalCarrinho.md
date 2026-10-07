# `src/components/ModalCarrinho.tsx`

## Descrição

Modal do **carrinho de vendas**: lista os itens (produtos/serviços) com controle de quantidade, subtotal por item, total geral e ações de remoção/limpeza. Apresentacional — sem estado próprio: o carrinho vem do hook `useCart` (pai) e a casca visual do `CartModalShell`.

## Contexto

Usado por `DailySaleForm` (venda nova) e `EditSaleForm` (edição de venda) para gerenciar os itens antes de salvar. Abre via `useCart` (`handleManageCart`/`openCarrinho` → `cartModalOpen`).

## Assinatura

```ts
interface ModalCarrinhoProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, tipo: 'PRODUTO' | 'SERVICO', newQty: number) => void;
  onRemoveItem: (id: number, tipo: 'PRODUTO' | 'SERVICO') => void;
  onClearCart: () => void;
}

const ModalCarrinho: React.FC<ModalCarrinhoProps>;
```

`CartItem` é o tipo de `src/types/sale.ts` (movido de `DailySaleForm` na refatoração):

```ts
interface CartItem {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  preco_venda?: number | null;
  quantidade: number;
  codigo_interno?: string;
  referencia?: string;
}
```

## Props

- `isOpen` - controla exibição/ocultamento do modal.
- `onClose` - fecha o modal (ESC, overlay, botão "Concluir" — repassado ao shell).
- `cartItems` - itens atuais do carrinho.
- `onUpdateQuantity` - atualiza a quantidade de um item.
- `onRemoveItem` - remove um item do carrinho.
- `onClearCart` - esvazia o carrinho (botão "Limpar Carrinho" no rodapé).

## Comportamento

- **Casca** (overlay/header/footer, ESC, focus-trap, portal, total): `CartModalShell`.
- **Resumo** (`totalItems`/`totalValue`): `getCartSummary` (`src/utils/cart`) — badge de contagem e total do rodapé.
- Estado vazio: mensagem central com ícone do carrinho.
- Itens: nome, badge de tipo (`badge-produto` azul / `badge-servico` roxo), código interno, preço unitário, controles `−`/`+` (mínimo 1, input numérico), subtotal e botão de remover.
- Rodapé esquerdo: "Limpar Carrinho" (visível apenas com itens).

## Dependências

- `CartModalShell` (`src/components/CartModalShell.tsx`).
- `getCartSummary` (`src/utils/cart`), `formatCurrency` (`src/utils/formatter`).
- Ícones MUI (`ShoppingCartIcon`, `DeleteIcon`, `AddIcon`, `RemoveIcon`).
- `<style jsx>` local **apenas** para itens/quantidade/ações (chrome é global `cart-modal-*`).

## Observações

- Na refatoração foram removidos: `createPortal`/`CloseIcon`/`useFocusTrap`/efeito ESC e o **`<style jsx>` de chrome duplicado** (overlay/container/header/footer/totais já existiam globais em `globals.css`).
- Responsivo: o bloco global `@media (max-width: 640px)` cuida do chrome; o local cuida das linhas de item (coluna) e do botão "Limpar Carrinho".