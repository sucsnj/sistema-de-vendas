# `src/components/catalog/UomModal.tsx`

> Modal de criação de unidade de medida (controlado).

## O que faz

- Campos **Sigla** (obrigatório) e **Descrição**; submit chama `options.salvarUnidadeMedida`.
- Fechar reseta o formulário e chama `options.abrirModalUnidadeMedida()`.

```ts
interface ModalAddUnidadeMedidaProps {
  uomForm: UnidadeMedidaFormData; // { sigla, descricao }
  setUomForm: React.Dispatch<React.SetStateAction<UnidadeMedidaFormData>>;
  options: UnidadeMedidaOptions; // { abrirModalUnidadeMedida, salvarUnidadeMedida }
}
```

## Relações

- **Usa:** `useFocusTrap`, `produtos.module.css`.
- **Usado por:** hook `useUnitOfMeasure`, via [ProductForm](../products/ProductForm.md).

## Notas

- Botão "Fechar" inverte a abertura via `abrirModalUnidadeMedida()`.
- Exporta `UnidadeMedidaFormData` e `UnidadeMedidaOptions`.
