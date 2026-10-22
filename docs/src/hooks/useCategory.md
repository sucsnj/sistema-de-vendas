# `src/hooks/useCategory.ts`

> Hook para gerenciar criação, edição e exclusão de categoria no cadastro rápido. Exporta `useCategory`.

## O que faz

- Controla modais de cadastro (`modalCategoriaOpen`, `catForm`) e edição (`modalCategoriaEditOpen`).
- Cria categoria com nome/descrição via `createCategory`, atualiza opções e seleciona criada.
- Atualiza/exclui categoria, sincroniza `setOptions.categorias` e ajusta paginação/listagem.

## Relações

- **Usa:** `fetchCategories`, `createCategory`, `deleteCategory`, `updateCategory` (`src/services/produtosService.ts`), `CategoriaFormData` (`src/types/categoria.ts`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** componentes de cadastro de produtos.

## Notas

- Arquivo `useCategory.ts`; identificador exportado é `useCategory`.