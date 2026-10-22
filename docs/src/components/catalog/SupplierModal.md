# `src/components/catalog/SupplierModal.tsx`

> Modal de criação de fornecedor (controlado).

## O que faz

- Campo **Nome** (obrigatório); submit chama `handleSaveSupplier`.
- Fechar limpa `newSupplierName` e fecha o modal.

```ts
interface SupplierModalProps {
  setSupplierModalOpen: (value: boolean) => void;
  newSupplierName: string;
  setNewSupplierName: (value: string) => void;
  handleSaveSupplier: (e: React.FormEvent) => void;
}
```

## Relações

- **Usa:** `useFocusTrap`, `produtos.module.css`.
- **Usado por:** [ProductForm](../products/ProductForm.md) (botão "+" de Fornecedor).

## Notas

- Recebe setters/handler diretos, diferente de categoria/UOM.
