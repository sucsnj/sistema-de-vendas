# `src/components/Resumo.tsx`

## Descrição

Painel de resumo financeiro para contas a pagar. Exibe totais pagos, pendentes, totais por distribuidora e seções auxiliares.

## Contexto

É usado em Contas a Pagar com a finalidade de exibir um resumo geral das contas a pagar de um determinado ano, permitindo uma visão panorâmica da situação financeira da empresa.

## Responsabilidades

- Calcular totais pagos, pendentes e anuais.
- Gerar totais por distribuidora.
- Renderizar componentes:
  - `TotaisPorDistribuidora`
  - `ConsolidacaoMensal`
  - `NotasDoMes`

## Props

- `contasAno`, `ano`, `mes`, `setAno`, `setMes`

## Dependências

- `ConsolidacaoMensal`
- `TotaisPorDistribuidora`
- `NotasDoMes`

## Observações

- O componente oferece visão consolidada do ano atual.
- A lógica de cálculo usa `useMemo` para otimização.
