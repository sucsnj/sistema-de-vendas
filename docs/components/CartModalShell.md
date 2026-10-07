# `src/components/CartModalShell.tsx`

## Descrição

Casca visual compartilhada dos modais de carrinho de vendas (`ModalCarrinho` e `ModalSelecionarItens`): overlay, container, cabeçalho (ícone + título + badge de itens + botão fechar), corpo rolável, rodapé (slots esquerdo, total e botão "Concluir"), portal no `document.body`, focus-trap e fechamento por ESC/overlay.

## Contexto

Extraído na refatoração dos grandes componentes. Antes o "chrome" do modal existia **duplicado** em `ModalCarrinho` (JSX + `<style jsx>` local) e `ModalSelecionarItens` (JSX), além de uma cópia **global** em `src/styles/globals.css`. O shell passa a ser a **fonte única** do chrome, estilizado pelas classes globais `cart-modal-*` (que já cobrem overlay/container/header/body/footer/totais e responsividade ≤640px).

## Assinatura

```ts
interface CartModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;            // id único do h3 (aria-labelledby)
  title: string;
  icon: React.ReactNode;      // ex.: <ShoppingCartIcon className="cart-modal-icon" />
  closeAriaLabel: string;
  summary: CartSummary;       // { totalItems, totalValue } — src/utils/cart
  footerLeft?: React.ReactNode; // ex.: botão "Limpar Carrinho" ou "Gerenciar"
  children: React.ReactNode;  // conteúdo do corpo (lista de itens, catálogo)
}

export const CartModalShell: React.FC<CartModalShellProps>;
```

## Responsabilidades

- Renderizar a casca via `createPortal(document.body)`; retorna `null` se `!isOpen` ou `typeof document === 'undefined'` (SSR).
- Fechar por **ESC** (`useEscClose`), clique no **overlay** (alvo = próprio overlay) e botões de fechar/"Concluir".
- Manter **foco dentro** do modal (`useFocusTrap`).
- Exibir badge de contagem quando `summary.totalItems > 0` e o total com `formatCurrency`.

## Dependências

- `useFocusTrap` (`src/utils/focus`), `useEscClose` (`src/hooks/useEscClose`), `formatCurrency` (`src/utils/formatter`), `CartSummary` (`src/utils/cart`).
- Classes globais `cart-modal-*` (`src/styles/globals.css`).

## Observações

- No fluxo atual apenas um shell fica aberto por vez (seleção ⇄ gerenciamento são mutuamente exclusivos no `useCart`).
- Estilos específicos de **item/catálogo** continuam nos modais consumidores via `<style jsx>` local (o escopo styled-jsx acompanha os elementos, mesmo renderizados via portal).