# `src/components/Agenda.tsx`

## Descrição

Painel que resume contas pendentes por vencimento e exibe próximas contas a pagar.

## Responsabilidades

- Agrupar contas pendentes por data de vencimento.
- Exibir os próximos vencimentos e total pendente.
- Exibir upload de OCR para leitura rápida de contas.

## Props

- `contasMes` - contas do mês atual.
- `contasAno` - todas as contas do ano.

## Observações

- Usa `useMemo` para calcular leituras de agenda e próximas contas.
- O componente também embute `OcrUpload` para leitura de boletos.
