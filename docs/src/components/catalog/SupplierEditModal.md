# `src/components/catalog/SupplierEditModal.tsx`

> Modal de edição de fornecedor, com exclusão embutida.

## O que faz

- Edita **Nome**; "Atualizar" chama `options.saveSupplier`.
- "Excluir" abre `SupplierDeleteModal` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface SupplierEditModalProps {
  supplierForm: SupplierFormData; // { name }
  setSupplierForm: React.Dispatch<React.SetStateAction<SupplierFormData>>;
  onDelete: () => void;
  options: SupplierOptions; // { openSupplierModal, saveSupplier }
}
```

## Relações

- **Usa:** [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useSupplier`, via "⋮" do [ProductForm](../products/ProductForm.md).

## Notas

- Exporta `SupplierFormData` e `SupplierOptions`.
