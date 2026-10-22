# `src/components/catalog/SupplierEditModal.tsx`

> Modal de edição de fornecedor, com exclusão embutida.

## O que faz

- Edita **Nome**; "Atualizar" chama `options.salvarFornecedor`.
- "Excluir" abre `SupplierDeleteModal` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface ModalFornecedorEditProps {
  fornecedorForm: FornecedorFormData; // { nome }
  setFornecedorForm: React.Dispatch<React.SetStateAction<FornecedorFormData>>;
  onDelete: () => void;
  options: FornecedorOptions; // { abrirModalFornecedor, salvarFornecedor }
}
```

## Relações

- **Usa:** [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useSupplier`, via "⋮" do [ProductForm](../products/ProductForm.md).

## Notas

- Exporta `FornecedorFormData` e `FornecedorOptions`.
