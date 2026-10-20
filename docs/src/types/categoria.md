# `src/types/categoria.ts`

> Tipos para categoria de produtos (usados em formulários e hooks de categoria).

## O que faz

- `CategoriaFormData`: estrutura do formulário de categoria (`nome`, `descricao`).
- `CategoriaOptions`: opções/ações para modal de categoria rápida (`abrirModalCategoria`, `salvarCategoria`).

## Relações

- **Usa:** tipos React para handler de formulário.
- **Usado por:** `src/hooks/useCategory.ts`, componentes de cadastro rápido de categoria.

## Notas

- Tipos simples, compartilhados entre hook e UI.