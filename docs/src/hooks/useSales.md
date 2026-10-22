# `src/hooks/useSales.ts`

> Hook que concentra estado e ações de vendas diárias do período selecionado. Exporta `useSales`.

## O que faz

- Estado: `sales` (`VendaDiaria[]`), `editingSale` (`VendaDiaria | null`), `loading`.
- Parâmetros: `(month, year, showToast, options?)` com `UseVendasOptions` (`filtro?: 'todas'|'positivas'|'negativas'`, `autoConsolidate?: boolean`).
- `loadSales()`: busca via `fetchDailySales(month, year, filter)` e dispara `autoConsolidate()` se ativo (padrões aplicados).
- Ações: `handleConsolidate()` (consolida mês), `handleBackup()` (executa backup e exibe mensagem), `handleEditSale(sale)`, `handleCancelEdit()`, `handleSaved()` (fecha edição e recarrega), `handleDeleteSale(id)` (verifica existência e regra `canEdit(sale.data)`; exibe toasts apropriados).

## Relações

- **Usa:** `fetchDailySales`, `consolidateMonthly`, `backupDatabase`, `deleteSale`, `autoConsolidate`, `VendaDiaria` (`src/services/vendasService.ts`), `canEdit` (`src/utils/edit.ts`).
- **Usado por:** páginas/componentes relacionados a vendas diárias.

## Notas

- Arquivo `useSales.ts`; identificador exportado é `useSales`.
- `autoConsolidate` é chamado após carregar quando `autoConsolidateEnabled` for true.