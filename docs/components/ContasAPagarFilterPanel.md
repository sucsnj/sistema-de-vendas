# `src/components/ContasAPagarFilterPanel.tsx`

## Descrição

Painel de filtragem e visualização da lista de contas a pagar.

## Responsabilidades

- Filtrar contas por distribuidora, status e intervalo de vencimento.
- Exibir tabela de contas com ações de ver, excluir e pagar.
- Exibir estado vazio quando não houver resultados.

## Props

- estados de filtro e seus setters
- `hoje` - data base para filtros
- `filteredContas` - contas já filtradas
- `handleView`, `handleDelete`, `handleEditar`, `handleStartPayment`
- `onClearFilters`

## Observações

- Inclui máscara visual para observações via pseudo-elemento CSS.
- O componente não realiza a filtragem; recebe resultados já filtrados.
