# `src/components/common/Button.tsx`

> Botão compartilhado com variantes visuais baseadas em tokens.

## O que faz

- Renderiza `button` com variantes `primary`, `secondary`, `danger` e `ghost`.
- Suporta tamanho `sm` e repassa props nativas do botão.
- Usa `button.module.css`.

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}
```

## Relações

- **Usa:** `button.module.css`.
- **Usado por:** componentes que precisam de ações padronizadas.

## Notas

- Primitiva criada na Fase 2 do ADR 0007; pode substituir botões repetidos gradualmente.
