# `src/components/catalog/CategoryModal.tsx`

> Modal de criação de categoria do catálogo (controlado).

## O que faz

- Campos **Nome** (obrigatório) e **Descrição**; submit chama `options.salvarCategoria`.
- Fechar reseta o `catForm` e chama `options.abrirModalCategoria()`.

```ts
interface ModalAddCategoriaProps {
  catForm: CategoriaFormData;
  setCatForm: React.Dispatch<React.SetStateAction<CategoriaFormData>>;
  options: CategoriaOptions; // { abrirModalCategoria, salvarCategoria }
}
```

## Relações

- **Usa:** `CategoriaFormData`/`CategoriaOptions` (`src/types/categoria.ts`), `useFocusTrap`, `produtos.module.css`.
- **Usado por:** hook `useCategory`, aberto a partir do [ProductForm](../products/ProductForm.md).

## Notas

- Montado só quando aberto (estado no hook `useCategory`); sem estado próprio.
- Botão "Fechar" inverte a abertura via `abrirModalCategoria()`.
