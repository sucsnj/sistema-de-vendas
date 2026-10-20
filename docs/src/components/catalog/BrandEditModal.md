# `src/components/catalog/BrandEditModal.tsx`

> Modal de edição de marca, com exclusão embutida.

## O que faz

- Edita **Nome**; "Atualizar" chama `options.salvarMarca`.
- "Excluir" abre `ModalMarcaExclusao` ([ProductDeleteModal](../products/ProductDeleteModal.md)); confirmar chama `onDelete` e fecha.

```ts
interface ModalMarcaEditProps {
  marcaForm: MarcaFormData; // { nome }
  setMarcaForm: React.Dispatch<React.SetStateAction<MarcaFormData>>;
  onDelete: () => void;
  options: MarcaOptions; // { abrirModalMarca, salvarMarca }
}
```

## Relações

- **Usa:** [ProductDeleteModal](../products/ProductDeleteModal.md), `useFocusTrap`.
- **Usado por:** hook `useMarca`, via "⋮" do [ProductForm](../products/ProductForm.md).

## Notas

- Exporta `MarcaFormData` e `MarcaOptions`; fechar limpa o formulário.
