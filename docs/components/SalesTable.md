# `src/components/SalesTable.tsx`

## Descrição

Tabela de vendas que exibe registros históricos e operações de edição/exclusão.

## Responsabilidades

- Exibir registros de vendas ordenados por data e ID.
- Controlar o número máximo de vendas exibidas via `localStorage`.
- Abrir diálogo de confirmação antes de exclusão.

## Props

- `sales` - lista de vendas.
- `onEditSale` - callback de edição.
- `onDeleteSale` - callback de exclusão.

## Observações

- Usa `ConfirmDialog` para segurança da exclusão.
- O número máximo de registros é persistido em `localStorage`.
