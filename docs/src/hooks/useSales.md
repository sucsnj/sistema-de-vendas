# `src/hooks/useSales.ts`

> Hook que concentra estado e ações de vendas diárias do período selecionado. Exporta `useVendas`.

## O que faz

- Estado: `sales` (`VendaDiaria[]`), `editingSale` (`VendaDiaria | null`), `loading`.
- Parâmetros: `(mes, ano, showToast, options?)` com `UseVendasOptions` (`filtro?: 'todas'|'positivas'|'negativas'`, `autoConsolidar?: boolean`).
- `loadSales()`: busca via `buscarVendasDiarias(mes,ano,filtro)` e dispara `autoConsolidar()` se ativo (padrões aplicados).
- Ações: `handleConsolidate()` (consolida mês), `handleBackup()` (executa backup e exibe mensagem), `handleEditSale(sale)`, `handleCancelEdit()`, `handleSaved()` (fecha edição e recarrega), `handleDeleteSale(id)` (verifica existência e regra `canEdit(sale.data)`; exibe toasts apropriados).

## Relações

- **Usa:** `buscarVendasDiarias`, `consolidarMensal`, `fazerBackup`, `excluirVenda`, `autoConsolidar`, `VendaDiaria` (`src/services/vendasService.ts`), `canEdit` (`src/utils/edit.ts`).
- **Usado por:** páginas/componentes relacionados a vendas diárias.

## Notas

- Arquivo `useSales.ts`; identificador exportado é `useVendas` (pt-BR).
- `autoConsolidar` é chamado após carregar quando `autoConsolidarAtivo` for true.