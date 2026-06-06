# `src/components/SalesChart.tsx`

## Descrição

Componente de visualização de gráfico de vendas usando `recharts`.

## Responsabilidades

- Exibir gráfico de linha ou barras.
- Permitir seleção de período de exibição (30, 7 ou 3 últimos registros).
- Exibir tooltip formatado.

## Props

- `data` - array de vendas diárias.

## Observações

- Os dados são ordenados e normalizados antes da renderização.
- O gráfico alterna entre `LineChart` e `BarChart`.
