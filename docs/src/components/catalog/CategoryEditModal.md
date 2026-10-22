# `src/components/catalog/CategoryEditModal.tsx`

> Modal de edição de categoria, com exclusão embutida.

## O que faz

- Edita **Nome**/**Descrição**; "Atualizar" chama `options.saveCategory`.
- "Excluir" abre `CategoryDeleteModal` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface CategoryEditModalProps {
  categoryForm: CategoryFormData;
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  onDelete: () => void;
  options: CategoryOptions;
}
```

## Relações

- **Usa:** `CategoryFormData`/`CategoryOptions` (`src/types/categoria.ts`), [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useCategory`, acionado pela marcação "⋮" do [ProductForm](../products/ProductForm.md)/[ServiceForm](../products/ServiceForm.md).

## Notas

- O botão "Fechar" também chama `openCategoryModal()` (inverte a abertura).
- Fechar limpa o `categoryForm`.
