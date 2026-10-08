# `src/hooks/useEscClose.ts`

## Descrição

Hook pequeno para **fechar por tecla ESC**. Registra um listener de `keydown` no `window` enquanto o componente/modal estiver aberto (`isOpen`). Fonte única extraída dos modais de carrinho (antes com `useEffect` duplicado em `ModalCarrinho` e `ModalSelecionarItens`).

## Assinatura

```ts
export const useEscClose = (isOpen: boolean, onClose: () => void): void;
```

## Comportamento

- Adiciona o listener no `window` quando `isOpen === true`; remove no cleanup.
- Só dispara `onClose()` se `event.key === 'Escape'`.
- Dependências: `[isOpen, onClose]`.

## Observações

- Usado pelo `CartModalShell` (casca compartilhada dos modais de carrinho). No futuro pode ser reutilizado por outros modais (se desejado), mantendo o comportamento idêntico.
- Não bloqueia outros listeners de ESC na página (o callback simplesmente verifica a condição).