# `src/components/catalog/BrandModal.tsx`

> Modal de criação de marca (controlado).

## O que faz

- Campo **Nome** (obrigatório); submit chama `handleSaveBrand`.
- Fechar limpa `newBrandName` e fecha o modal.

```ts
interface BrandModalProps {
  setBrandModalOpen: (value: boolean) => void;
  newBrandName: string;
  setNewBrandName: (value: string) => void;
  handleSaveBrand: (e: React.FormEvent) => void;
}
```

## Relações

- **Usa:** `useFocusTrap`, `produtos.module.css`.
- **Usado por:** [ProductForm](../products/ProductForm.md) (botão "+" de Marca).

## Notas

- Recebe setters/handler diretos, diferente de categoria/UOM (que usam `options`).
