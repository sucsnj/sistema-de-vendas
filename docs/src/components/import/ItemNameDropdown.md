# `src/components/import/ItemNameDropdown.tsx`

> Campo com dropdown de sugestões para vincular o item da NF-e a um produto/serviço.

## O que faz

- Busca `fetchProducts` + `fetchServices` (8 cada) com debounce de 250ms; EAN = código de barras principal.
- Seleciona uma sugestão (`onSelectSuggestion`) ou propaga o texto digitado (`onTextChange`).
- Fecha ao clicar fora.

```ts
interface SugestaoItem {
  id: number; tipo: 'PRODUTO' | 'SERVICO'; nome: string; precoVenda: number;
  estoque?: number; codigoInterno?: string; ean?: string; categoriaNome?: string;
}
interface ItemNameDropdownProps {
  item: ItemComStatus; onSelectSuggestion: (s: SugestaoItem) => void;
  onTextChange: (texto: string) => void; disabled?: boolean;
}
```

## Relações

- **Usa:** `fetchProducts`/`fetchServices` (`src/services/produtosService.ts`), `ItemComStatus` (`src/hooks/useImportItems.ts`), `modalImport.module.css`.
- **Usado por:** [ImportItemsModal](./ImportItemsModal.md) (coluna "Item no Sistema").

## Notas

- Sincroniza o texto quando `item.descricao` muda por fora (`prevDescription`).
- Extraído do modal na refatoração; `SugestaoItem` é o view-model do dropdown.
