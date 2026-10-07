# `src/components/ItemNomeDropdown.tsx`

## Descrição

Campo de texto **com dropdown de sugestões** usado na coluna "Item no Sistema (Vínculo)" do `ModalImportItens`: ao digitar, busca produtos e serviços cadastrados (debounce 250ms) e permite selecionar o item a ser vinculado à nota. Extraído do modal na refatoração (antes era um subcomponente no mesmo arquivo).

## Assinatura

```ts
interface SugestaoItem {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  precoVenda: number;
  estoque?: number;
  codigoInterno?: string;
  ean?: string;
  categoriaNome?: string;
}

interface ItemNomeDropdownProps {
  item: ItemComStatus;                     // src/hooks/useImportItens
  onSelectSuggestion: (sugestao: SugestaoItem) => void;
  onTextChange: (novoTexto: string) => void;
  disabled?: boolean;
}

const ItemNomeDropdown: React.FC<ItemNomeDropdownProps>;
```

## Comportamento

- Estado interno: `term`, `suggestions`, `loading`, `isOpen`, `hasSearched` (`prevDescription` para sincronizar quando `item.descricao` muda por fora — Ex.: seleção externa).
- `runSearch(text)`: se vazio, limpa e fecha; senão busca `buscarProdutos` + `buscarServicos` (pageSize 8 cada), transforma em `SugestaoItem[]` (EAN = código de barras principal) e abre o dropdown.
- **Debounce 250ms** (`handleInputChange`): abre o dropdown imediatamente com "Buscando itens…", dá o timeout e dispara `runSearch`.
- Seleção (`handleSelect`): grava o nome no campo, chama `onSelectSuggestion` e fecha.
- **Fechar por clique fora** (`mousedown` no documento, verifica `containerRef`).
- Foco reabre o dropdown se já houve busca com resultados (`hasSearched && suggestions.length > 0`).

## Dependências

- `buscarProdutos`/`buscarServicos` (`src/services/produtosService`).
- Estilos `styles/modalImport.module.css` (dropzone/dropdown de importação).
- Root `item.descricao` com atualização em tempo de render (padrão `prevDescription` preservado da implementação original).

## Observações

- Nomes de identificadores renomeados para inglês (ADR 0004): `termo`→`term`, `sugestoes`→`suggestions`, `aberto`→`isOpen`, `buscou`→`hasSearched`, `executarBusca`→`runSearch`, `handleClickFora`→`handleClickOutside`, props `onSelectSugestao`→`onSelectSuggestion`/`onChangeTexto`→`onTextChange`.
- `SugestaoItem` vive aqui (view-model do dropdown); `ItemComStatus` vive em `useImportItens` (estado do fluxo de importação).