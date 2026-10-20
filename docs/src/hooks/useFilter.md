# `src/hooks/useFilter.ts`

> Hook para gerenciar filtro do histórico de vendas, restaurando e persistindo no localStorage.

## O que faz

- Estado `filtro` com inicialização lazy: lê `localStorage` (se navegador), valida via `isFiltroValido`; padrão `todas` em SSR.
- `changeFiltro(value)`: atualiza estado e grava em `localStorage` com chave `historicoFiltro`.
- Tipo exportado `FiltroVendas = 'todas' | 'positivas' | 'negativas'`.

## Relações

- **Usa:** `React.useState`.
- **Usado por:** páginas/componentes do histórico de vendas.

## Notas

- Evita render extra ao usar lazy initializer; valida valores salvos.