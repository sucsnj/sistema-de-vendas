# `src/components/SalesTable.tsx`

## Descrição

Tabela de vendas que exibe registros históricos e operações de edição/exclusão.

## Contexto

É usado em Vendas Diárias com a finalidade de exibir uma tabela de vendas diárias, permitindo uma visão panorâmica da evolução das vendas.

## Responsabilidades

- Exibir registros de vendas ordenados por data e ID.
- Controlar o número máximo de vendas exibidas via `localStorage`.
- Abrir diálogo de confirmação antes de exclusão.

## Props

- `sales` - lista de vendas.
- `onEditSale` - callback de edição.
- `onDeleteSale` - callback de exclusão.

## Dependências

- `ConfirmDialog`
- `EditIcon`
- `DeleteIcon`
- `Tooltip`
- `VendaDiaria`
- `formatCurrency`
- `formatDateString`
- `toTimestamp`

## Observações

- Usa `ConfirmDialog` para segurança da exclusão.
- O número máximo de registros é persistido em `localStorage`.
