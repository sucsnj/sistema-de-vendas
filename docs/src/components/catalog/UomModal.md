# `src/components/catalog/UomModal.tsx`

> Modal de criação de unidade de medida (controlado).

## O que faz

- Campos **Sigla** (obrigatório) e **Descrição**; submit chama `options.saveUnitOfMeasure`.
- Fechar reseta o formulário e chama `options.openUnitOfMeasureModal()`.

```ts
interface UnitOfMeasureModalProps {
  uomForm: UnitOfMeasureFormData; // { abbreviation, description }
  setUomForm: React.Dispatch<React.SetStateAction<UnitOfMeasureFormData>>;
  options: UnitOfMeasureOptions; // { openUnitOfMeasureModal, saveUnitOfMeasure }
}
```

## Relações

- **Usa:** `useFocusTrap`, `produtos.module.css`.
- **Usado por:** hook `useUnitOfMeasure`, via [ProductForm](../products/ProductForm.md).

## Notas

- Botão "Fechar" inverte a abertura via `openUnitOfMeasureModal()`.
- Exporta `UnitOfMeasureFormData` e `UnitOfMeasureOptions`.
