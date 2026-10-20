# `src/pages/_app.tsx`

> Componente raiz do Next.js: envolve todas as páginas com os provedores globais.

## O que faz

- Injeta `QueryClientProvider` (`@tanstack/react-query`) para toda a aplicação.
- Define metadados HTML globais (título "Vendas", descrição e favicon).
- Renderiza a navegação global `<Nav />` e o host único de notificações `<Toaster />` (ADR 0003).
- Estrutura padrão das telas: `Nav` + `<Component />` + `Toaster`.

## Relações

- **Usa:** `src/components/common/Nav`, `src/components/common/Toaster`, `src/styles/globals.css`.
- **Usado por:** todas as páginas do Pages Router.

## Notas

- Ponto de extensão para temas, tratamento de erros e estado global.
