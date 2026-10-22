# `src/components/catalog/CategoryModal.tsx`

> Modal de criação de categoria do catálogo (controlado).

## O que faz

- Campos **Nome** (obrigatório) e **Descrição**; submit chama `options.saveCategory`.
- Fechar reseta o `categoryForm` e chama `options.openCategoryModal()`.

```ts
interface CategoryModalProps {
  categoryForm: CategoryFormData;
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  options: CategoryOptions; // { openCategoryModal, saveCategory }
}
```

## Relações

- **Usa:** `CategoryFormData`/`CategoryOptions` (`src/types/categoria.ts`), `useFocusTrap`, `produtos.module.css`.
- **Usado por:** hook `useCategory`, aberto a partir do [ProductForm](../products/ProductForm.md).

## Notas

- Montado só quando aberto (estado no hook `useCategory`); sem estado próprio.
- Botão "Fechar" inverte a abertura via `openCategoryModal()`.
