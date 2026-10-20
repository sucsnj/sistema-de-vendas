# `src/components/catalog/SupplierModal.tsx`

> Modal de criação de fornecedor (controlado).

## O que faz

- Campo **Nome** (obrigatório); submit chama `handleSalvarFornecedor`.
- Fechar limpa `novoFornecedorNome` e fecha o modal.

```ts
interface ModalFornecedorProps {
  setModalFornecedorOpen: (value: boolean) => void;
  novoFornecedorNome: string;
  setNovoFornecedorNome: (value: string) => void;
  handleSalvarFornecedor: (e: React.FormEvent) => void;
}
```

## Relações

- **Usa:** `useFocusTrap`, `produtos.module.css`.
- **Usado por:** [ProductForm](../products/ProductForm.md) (botão "+" de Fornecedor).

## Notas

- Recebe setters/handler diretos, diferente de categoria/UOM.
