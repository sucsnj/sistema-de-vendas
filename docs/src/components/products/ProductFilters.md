# `src/components/products/ProductFilters.tsx`

> Formulário de filtros da listagem de produtos/serviços.

## O que faz

- Filtros: Buscar, Tipo, Categoria, Marca, Fornecedor e Status.
- Trocar um select reseta a página (`actions.mudarPagina(1)`); "Filtrar" submete e "Limpar" limpa.

```ts
export interface FiltrosState {
  search: string; tipo: 'PRODUTO' | 'SERVICO' | 'TODOS';
  categoriaId: number | ''; marcaId: number | ''; fornecedorId: number | '';
  status: 'ATIVO' | 'INATIVO' | 'TODOS';
}
interface FiltrosProps {
  state: FiltrosState; data: FiltrosData;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosState>>;
  actions: FiltrosActions; // { buscar, limpar, mudarPagina }
}
```

## Relações

- **Usa:** `CategoriaData`/`MarcaData`/`FornecedorData` (`src/services/produtosService.ts`), `produtos.module.css`.
- **Usado por:** `../../pages/produtos.md`.

## Notas

- Apresentacional; o estado dos filtros fica na página.
