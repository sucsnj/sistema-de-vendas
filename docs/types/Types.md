# Tipos (`src/types/`)

## Descrição

Tipos compartilhados entre camadas (páginas, componentes, serviços e API) que não pertencem a um único módulo. Muitos tipos do projeto vivem **dentro** de `src/services/*.ts` (ex.: `NotaDetalhe`, `TabelaRow`, `ProdutoFormData`), e não aqui.

## Arquivos

### `categoria.ts`

```ts
interface CategoriaFormData {
  nome: string;
  descricao: string;
}

interface CategoriaOptions {
  abrirModalCategoria: () => void;
  salvarCategoria: React.FormEventHandler<HTMLFormElement>;
}
```

- `CategoriaFormData`: payload de criação/edição de categoria.
- `CategoriaOptions`: contrato injetado em `ModalCategoria`/`ModalCategoriaEdit` (abrir modal e salvar), usado pela página `cadastro.tsx`.

### `sale.ts`

```ts
type CatalogItemType = 'PRODUTO' | 'SERVICO';

interface CartItem {
  id: number;
  tipo: CatalogItemType;
  nome: string;
  preco_venda: number;
  quantidade: number;
  codigo_interno?: string;
  referencia?: string;
  estoque?: number;
}
```

- `CatalogItemType`: tipo/categoria de um item do catálogo ou carrinho.
- `CartItem`: item do carrinho de uma venda — movido de `DailySaleForm.tsx` (componente) para a camada de tipos porque é compartilhado entre **4 arquivos** (`useCart`, `ModalCarrinho`, `ModalSelecionarItens`, `DailySaleForm`/`EditSaleForm`).

## Observações

- Convenção: tipos de domínio coesos ficam nos services (ex.: `NotaDetalhe` em `notasService.ts`, `TabelaRow` em `tabelaService.ts`); `src/types/` guarda apenas o que é compartilhado entre camadas distintas.