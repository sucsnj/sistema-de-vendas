# `src/components/catalog/BrandModal.tsx`

> Modal de criação de marca (controlado).

## O que faz

- Campo **Nome** (obrigatório); submit chama `handleSalvarMarca`.
- Fechar limpa `novaMarcaNome` e fecha o modal.

```ts
interface ModalMarcaProps {
  setModalMarcaOpen: (value: boolean) => void;
  novaMarcaNome: string;
  setNovaMarcaNome: (value: string) => void;
  handleSalvarMarca: (e: React.FormEvent) => void;
}
```

## Relações

- **Usa:** `useFocusTrap`, `produtos.module.css`.
- **Usado por:** [ProductForm](../products/ProductForm.md) (botão "+" de Marca).

## Notas

- Recebe setters/handler diretos, diferente de categoria/UOM (que usam `options`).
