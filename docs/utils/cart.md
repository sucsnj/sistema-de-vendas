# `src/utils/cart.ts`

## Descrição

Funções puras para **resumo do carrinho de vendas**. Centralizam o cálculo de `totalItems` (soma de quantidades) e `totalValue` (soma de `preco_venda × quantidade`). Extraídas da refatoração dos modais de carrinho para eliminar duplicação (antes feita com `.reduce` em `useCart`, `ModalCarrinho` e `ModalSelecionarItens`).

## Assinatura

```ts
export interface CartSummary {
  totalItems: number;
  totalValue: number;
}

export function getCartSummary(cartItems: CartItem[]): CartSummary;
```

- `CartItem` vem de `src/types/sale.ts` (`{ id, tipo, nome, preco_venda?: number|null, quantidade, ... }`).

## Comportamento

- Itera o array e acumula: `totalItems += item.quantidade`, `totalValue += (item.preco_venda ?? 0) * item.quantidade`.
- Puro, sem efeitos colaterais, determinístico.

## Observações

- Fonte única usada por `useCart` (para expor `totalCartCount`/`totalCartValue`) e por `ModalCarrinho`/`ModalSelecionarItens` (para badge + total do rodapé).
- `preco_venda` pode ser `null`/`undefined` — trata com fallback `0` (protege contra dados inconsistentes).