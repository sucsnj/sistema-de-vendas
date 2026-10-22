# `src/components/catalog/BrandEditModal.tsx`

> Modal de edição de marca, com exclusão embutida.

## O que faz

- Edita **Nome**; "Atualizar" chama `options.saveBrand`.
- "Excluir" abre `BrandDeleteModal` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface BrandEditModalProps {
  brandForm: BrandFormData; // { name }
  setBrandForm: React.Dispatch<React.SetStateAction<BrandFormData>>;
  onDelete: () => void;
  options: BrandOptions; // { openBrandModal, saveBrand }
}
```

## Relações

- **Usa:** [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useBrand`, via "⋮" do [ProductForm](../products/ProductForm.md).

## Notas

- Exporta `BrandFormData` e `BrandOptions`; fechar limpa o formulário.
