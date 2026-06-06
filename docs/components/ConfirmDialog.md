# `src/components/ConfirmDialog.tsx`

## Descrição

Componente de diálogo de confirmação para ações sensíveis.

## Responsabilidades

- Renderizar modal com título, mensagem e botões de confirmação/cancelamento.
- Gerenciar foco e navegação por teclado.
- Fechar com `Escape` ou clique nos botões.

## Props

- `open`, `title`, `message`
- `confirmText`, `cancelText`
- `onConfirm`, `onCancel`

## Observações

- Usa `createPortal` para renderizar no `document.body`.
- Oferece acessibilidade básica com roles ARIA e controle de tabulação.
