# `src/components/common/Button.tsx`

> Botão compartilhado com variantes visuais baseadas em tokens.

## O que faz

- Renderiza `button` com aparência universal única.
- Suporta ícone opcional (`icon`) e texto.
- Repassa props nativas do botão.
- Usa `button.module.css`.

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}
```

## Relações

- **Usa:** `button.module.css`.
- **Usado por:** componentes que precisam de ações padronizadas.

## Notas

- Primitiva criada na Fase 2 do ADR 0007; pode substituir botões repetidos gradualmente.
