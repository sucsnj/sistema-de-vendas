# `src/components/common/Nav.tsx`

> Barra de navegação superior com links das rotas e alternância de tema.

## O que faz

- Links para `/`, `/resumo`, `/historico`, `/contas-a-pagar`, `/tabela`, `/produtos`.
- Alterna tema em ciclo `system → light → dark`, aplicando classes em `document.documentElement` e persistindo em `localStorage['themeMode']`.

## Relações

- **Usa:** `next/link`, `nav.module.css`, ícones MUI (`Brightness7`, `Brightness4`, etc.).
- **Usado por:** layout global (aparece em todas as páginas).

## Notas

- Estado inicial do tema lido do `localStorage` (default `system`); aplicação direta no `document`.
- Bloco de logo comentado aguardando melhoria de UI.
