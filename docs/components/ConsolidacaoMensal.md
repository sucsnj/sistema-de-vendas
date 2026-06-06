# `src/components/ConsolidacaoMensal.tsx`

## Descrição

Componente de resumo que exibe valores pagos e pendentes por mês.

## Responsabilidades

- Renderizar tabela resumida de consolidação mensal.
- Formatar valores usando utilitário de moeda.

## Props

- `meses` - lista de objetos com `mes`, `pago` e `pendente`.

## Observações

- Usa `toLocaleString('pt-BR', { month: 'short' })` para exibir o nome do mês.
