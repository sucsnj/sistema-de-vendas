# `src/components/catalog/UomEditModal.tsx`

> Modal de edição de unidade de medida, com exclusão embutida.

## O que faz

- Edita **Sigla**/**Descrição**; "Atualizar" chama `options.saveUnitOfMeasure`.
- "Excluir" abre `UnitOfMeasureDeleteModal` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface UnitOfMeasureEditModalProps {
  uomForm: UnitOfMeasureFormData;
  setUomForm: React.Dispatch<React.SetStateAction<UnitOfMeasureFormData>>;
  onDelete: () => void;
  options: UnitOfMeasureOptions;
}
```

## Relações

- **Usa:** [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useUnitOfMeasure`, via [ProductForm](../products/ProductForm.md).

## Notas

- Fechar reseta o formulário e chama `openUnitOfMeasureModal()`.
