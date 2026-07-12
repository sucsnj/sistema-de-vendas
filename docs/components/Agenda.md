# `src/components/Agenda.tsx`

## Descrição

Painel que resume contas pendentes por vencimento e exibe próximas contas a pagar.

## Contexto

Utilizado no Contas a Pagar para dar visão rápida das contas do ano.

## Responsabilidades

- Agrupar contas pendentes por data de vencimento.
- Exibir os próximos vencimentos e total pendente.
- Exibir upload de OCR para leitura rápida de contas.

## Props

- `contasMes` - contas do mês atual.
- `contasAno` - todas as contas do ano.

## Dependências

- `contasService` (tipos e dados).
- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).
- `contas.module.css` (estilos).

## Exemplo de uso

```tsx
<Agenda contasAno={contasDoAno} contasMes={contasDoMes} />
```

## Observações

- Usa `useMemo` para calcular leituras de agenda e próximas contas.
- O componente também embute `OcrUpload` para leitura de boletos.
- Limites de itens podem ser ajustados conforme necessidade.
