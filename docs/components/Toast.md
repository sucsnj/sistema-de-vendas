# `src/components/Toast.tsx` e `src/components/Toaster.tsx`

## Descrição

- **`Toast.tsx`** — componente **apresentacional** de notificação flutuante (mensagem + tipo visual + auto-close + fechar manual).
- **`Toaster.tsx`** — **host global** que lê o store de toasts e renderiza o `Toast` ativo (uma única instância, montada em `src/pages/_app.tsx`).

## Arquitetura (fonte única) — ver ADR 0003

As notificações têm **um único canal**, sem estado local por página/componente:

1. `src/utils/toast.ts` — **store singleton** com `showToast(message, type?, duration?)`, `dismissToast()`, `subscribeToast` e `getToastSnapshot`/`getServerToastSnapshot` (para `useSyncExternalStore`).
2. `src/hooks/useToast.ts` — hook que consome o store via `useSyncExternalStore`; retorna `{ toastOpen, toastMessage, toastType, toastDuration, showToast, closeToast }`.
3. `src/components/Toaster.tsx` — renderiza o toast ativo na posição padrão `top-right`.

Qualquer camada (página, hook, component) chama `showToast(...)` vindo de `useToast()` ou direto de `utils/toast.ts`. Sem prop drilling, sem DOM direto, sem `#toast-root`.

## Assinatura

```ts
interface ToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  position?:
    | 'top-right'
    | 'bottom-right'
    | 'top-left'
    | 'top-center'
    | 'local-top-right'
    | 'local-top-left';
  duration?: number | null;
}

const Toast: React.FC<ToastProps>;   // apresentacional
const Toaster: React.FC<{}>;          // host global (top-right)
```

## Props (`Toast`)

- `open` - indica se o toast deve ser exibido.
- `message` - mensagem a ser exibida.
- `type` - tipo de mensagem ('success', 'error', 'info'); default `'info'`.
- `onClose` - callback para fechar o toast.
- `position` - posição do toast na tela; default `'top-right'` (o `Toaster` sempre usa `top-right`).
- `duration` - tempo de exibição em milissegundos; default `3000`; se `null`, não fecha automaticamente.

## Dependências

- `Toast` — `useEffect` (timer de `duration`) + styled-jsx.
- `Toaster` — `useToast` (que usa `useSyncExternalStore` do React).

## Observações

- `useSyncExternalStore` usa `getServerSnapshot` (estado inicial `{ open: false }`) — **nenhum toast é exibido em SSR** e não há mismatch de hidratação.
- `showToast`/`dismissToast` são funções estáveis (módulo), então podem entrar sem problema em dependências de `useCallback`.
- Substituiu tanto o toast DOM baseado em `#toast-root` (que nunca era renderizado → silenciosamente quebrado) quanto o estado local duplicado de cada página/componente.
- O padrão está documentado em `docs/adr/0003-padrao-de-notificacoes-toast.md`.