# `src/components/Resumo.tsx`

## Descrição

Painel de resumo financeiro para contas a pagar. Exibe totais pagos, pendentes, totais por distribuidora e seções auxiliares.

## Responsabilidades

- Calcular totais pagos, pendentes e anuais.
- Gerar totais por distribuidora.
- Renderizar componentes:
  - `TotaisPorDistribuidora`
  - `ConsolidacaoMensal`
  - `NotasDoMes`

## Props

- `contasAno`, `ano`, `mes`, `setAno`, `setMes`

## Observações

- O componente oferece visão consolidada do ano atual.
- A lógica de cálculo usa `useMemo` para otimização.
