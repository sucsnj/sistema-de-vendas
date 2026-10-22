# `src/components/catalog/UomEditModal.tsx`

> Modal de edição de unidade de medida, com exclusão embutida.

## O que faz

- Edita **Sigla**/**Descrição**; "Atualizar" chama `options.salvarUnidadeMedida`.
- "Excluir" abre `UnitOfMeasureDeleteModal` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface ModalUnidadeMedidaEditProps {
  uomForm: UnidadeMedidaFormData;
  setUomForm: React.Dispatch<React.SetStateAction<UnidadeMedidaFormData>>;
  onDelete: () => void;
  options: UnidadeMedidaOptions;
}
```

## Relações

- **Usa:** [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useUnitOfMeasure`, via [ProductForm](../products/ProductForm.md).

## Notas

- Fechar reseta o formulário e chama `abrirModalUnidadeMedida()`.
