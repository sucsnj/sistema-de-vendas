# `src/components/products/StockAdjustModal.tsx`

> Modal de ajuste de estoque com histórico de movimentações.

## O que faz

- Exibe nome/estoque atual, campo Quantidade (positiva ou negativa) e Descrição.
- Lista as últimas 10 movimentações; botões "Registrar Ajuste" (`onSave`) e Cancelar.

```ts
interface ModalAjusteEstoqueProps {
  open: boolean; itemName: string; itemEstoque: number;
  quantidade: string; descricao: string;
  setQuantidade: React.Dispatch<React.SetStateAction<string>>;
  setDescricao: React.Dispatch<React.SetStateAction<string>>;
  movimentacoes: MovimentacaoEstoqueData[]; movimentacoesLoading: boolean;
  onSave: () => void; onClose: () => void;
}
```

## Relações

- **Usa:** `MovimentacaoEstoqueData` (`src/services/produtosService.ts`), `useFocusTrap`, `produtos.module.css`.
- **Usado por:** [ProductForm](./ProductForm.md) (botão "Ajustar" em edição).

## Notas

- Controlado: o pai grava e fecha. A movimentação `AJUSTE` é criada no salvamento do produto, não aqui.
- Histórico é apenas informativo; foco automático no campo Quantidade.
