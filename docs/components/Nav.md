# `src/components/Nav.tsx`

## Descrição

Barra de navegação superior do aplicativo com links para as principais rotas e alternância de tema.

## Responsabilidades

- Exibir links para as páginas principais.
- Gerenciar modo de tema (`system`, `light`, `dark`) e persistir no `localStorage`.
- Aplicar classes de tema ao elemento `document.documentElement`.

## Observações

- O componente depende de `styles/nav.module.css`.
- O modo de tema é aplicado diretamente ao `document` e salvo localmente.
