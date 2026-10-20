# `src/components/common/ConfirmDialog.tsx`

> Diálogo de confirmação para ações sensíveis (exclusões).

## O que faz

- Exibe título/mensagem e botões confirmar/cancelar; renderiza via `createPortal` no `document.body`.
- ESC e clique no backdrop fecham; sem `onCancel`, o fechamento chama `onConfirm`.
- Mantém o foco no diálogo (`useFocusTrap`).

```ts
interface ConfirmDialogProps {
  open: boolean; title: string; message: string;
  confirmText?: string; cancelText?: string; // cancel só aparece se onCancel e cancelText
  onConfirm: () => void; onCancel?: () => void;
}
```

## Relações

- **Usa:** `useShortcuts` (`src/utils/shortcuts.tsx`), `useFocusTrap` (`src/utils/focus.tsx`).
- **Usado por:** [PayablesFilterPanel](../payables/PayablesFilterPanel.md), [PayablesLastTen](../payables/PayablesLastTen.md), [SalesTable](../sales/SalesTable.md), [MonthNotes](../summary/MonthNotes.md).

## Notas

- Acessibilidade com `role="dialog"`, `aria-modal` e `aria-labelledby`/`aria-describedby`.
