# `src/pages/historico.tsx`

> Histórico de Vendas (`/historico`): lista as vendas do período com filtro e permite editar/excluir.

## O que faz

- Seleciona mês/ano (`getDateArray`) e carrega as vendas via `useVendas(..., { filtro, autoConsolidar: false })`.
- Filtro dinâmico por valor (`todas` | `positivas` | `negativas`), persistido via `useFiltro`.
- Exibe `SalesTable` com edição (`EditSaleForm`) e exclusão.
- Exporta/importa vendas via `ExportButtons`.

## Relações

- **Usa:** `SalesTable`, `ExportButtons`, `EditSaleForm`; hooks `useToast`, `useVendas`, `useFiltro`; utils `date`, `captalize`.
- **Usado por:** consome `./api/vendas.md` e `./api/venda-itens.md`.

## Notas

- Compartilha lógica com `./index.md`, mas com `autoConsolidar` desligado.
