# `src/components/products/ProductDeleteModal.tsx`

> Modais de confirmação de exclusão do catálogo (item e entidades auxiliares).

## O que faz

- Default `ModalProdExclusao`: confirma a exclusão do item (avisa que é irreversível e remove os códigos de barras).
- Variantes nomeadas: `ModalCatExclusao`, `ModalMarcaExclusao`, `ModalFornecedorExclusao`, `ModalUomExclusao`.
- `if (!open) return null;`; botões Excluir (destaque `--danger`) e Cancelar.

```ts
interface ModalProdExclusaoProps {
  open: boolean; item: ItemData | null; onConfirm: () => void; onClose: () => void;
}
// Variantes recebem a entidade só para a mensagem:
// ModalCatExclusao { categoria }; ModalMarcaExclusao { marca };
// ModalFornecedorExclusao { fornecedor }; ModalUomExclusao { unidadeMedida }
```

## Relações

- **Usa:** `ItemData` (`src/services/produtosService.ts`), `useFocusTrap`, `produtos.module.css`.
- **Usado por:** [CategoryEditModal](../catalog/CategoryEditModal.md), [BrandEditModal](../catalog/BrandEditModal.md), [SupplierEditModal](../catalog/SupplierEditModal.md), [UomEditModal](../catalog/UomEditModal.md).

## Notas

- Props e confirmação seguem o mesmo formato dos modais de catálogo.
