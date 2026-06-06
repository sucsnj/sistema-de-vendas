# `src/components/NotasDoMes.tsx`

## Descrição

Painel que exibe notas fiscais do mês e permite excluir registros.

## Responsabilidades

- Buscar notas do período usando React Query.
- Exibir seleção de mês e ano.
- Calcular somatório de valores de notas.
- Excluir nota após confirmação.

## Props

- `ano`, `mes`, `setAno`, `setMes`

## Observações

- O componente usa `useQuery` para buscar dados e `invalidateQueries` após exclusão.
- Formata valores e datas para exibição.
