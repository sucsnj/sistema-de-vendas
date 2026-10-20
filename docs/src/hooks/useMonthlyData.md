# `src/hooks/useMonthlyData.ts`

> Hook para concentrar estado de consolidações mensais e ações (carregar/excluir). Exporta `useMensais`.

## O que faz

- Estado `mensais` (`VendaMensal[]`).
- `loadMensais()`: busca todas via `buscarTodosMensais` (estável via `useCallback`).
- `handleDelete(id)`: exclui via `excluirMensal` e recarrega, com toasts de sucesso/erro.

## Relações

- **Usa:** `buscarTodosMensais`, `excluirMensal`, `VendaMensal` (`src/services/vendasService.ts`).
- **Usado por:** páginas/componentes de consolidações mensais.

## Notas

- Arquivo `useMonthlyData.ts`; identificador exportado é `useMensais` (pt-BR).
- Callback `loadMensais` depende de `showToast`? Não — `handleDelete` usa `showToast`; `loadMensais` não. Mantido estável conforme código.