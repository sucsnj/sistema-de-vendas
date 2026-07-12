# `src/components/ContasAPagarFilterPanel.tsx`

## Descrição

Painel de filtragem e visualização da lista de contas a pagar.

## Contexto

Utilizado no Contas a Pagar para filtrar e visualizar contas a pagar.

## Responsabilidades

- Filtrar contas por distribuidora, status e intervalo de vencimento.
- Exibir tabela de contas com ações de ver, excluir e pagar.
- Exibir estado vazio quando não houver resultados.

## Props

- estados de filtro e seus setters
- `hoje` - data base para filtros
- `filteredContas` - contas já filtradas
- `handleView`, `handleDelete`, `handleEditar`, `handleStartPayment`
- `onClearFilters`

## Dependências

- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).

## Exemplo de uso

```tsx
<ContasAPagarFilterPanel
  filtroDistribuidora={filtroDistribuidora}
  setFiltroDistribuidora={setFiltroDistribuidora}
  filtroStatus={filtroStatus}
  setFiltroStatus={setFiltroStatus}
  filtroVencimentoDe={filtroVencimentoDe}
  setFiltroVencimentoDe={setFiltroVencimentoDe}
  filtroVencimentoAte={filtroVencimentoAte}
  setFiltroVencimentoAte={setFiltroVencimentoAte}
  hoje={hoje}
  filteredContas={filteredContas}
  handleView={handleView}
  handleDelete={handleDelete}
  handleStartPayment={handleStartPayment}
  onClearFilters={onClearFilters}
/>
```

## Observações

- Inclui máscara visual para observações via pseudo-elemento CSS.
- O componente não realiza a filtragem; recebe resultados já filtrados.
