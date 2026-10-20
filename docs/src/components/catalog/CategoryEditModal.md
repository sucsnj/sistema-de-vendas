# `src/components/catalog/CategoryEditModal.tsx`

> Modal de edição de categoria, com exclusão embutida.

## O que faz

- Edita **Nome**/**Descrição**; "Atualizar" chama `options.salvarCategoria`.
- "Excluir" abre `ModalCatExclusao` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface ModalCategoriaEditProps {
  catForm: CategoriaFormData;
  setCatForm: React.Dispatch<React.SetStateAction<CategoriaFormData>>;
  onDelete: () => void;
  options: CategoriaOptions;
}
```

## Relações

- **Usa:** `CategoriaFormData`/`CategoriaOptions` (`src/types/categoria.ts`), [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useCategoria`, acionado pela marcação "⋮" do [ProductForm](../products/ProductForm.md)/[ServiceForm](../products/ServiceForm.md).

## Notas

- O botão "Fechar" também chama `abrirModalCategoria()` (inverte a abertura).
- Fechar limpa o `catForm`.
