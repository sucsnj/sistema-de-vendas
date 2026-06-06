# `src/pages/api/contas/import.ts`

## Descrição

Endpoint para importar contas a pagar via XML.

## Métodos

- `POST` - processa XML enviado e adiciona registros de contas a pagar.

## Observações

- O frontend usa este endpoint para importar arquivos de notas fiscais.
- A importação valida campos obrigatórios e salva na base local.
 - Ao processar duplicatas, os valores monetários são validados/normalizados por `validateCurrency`.
 - Datas de vencimento são validadas com `validateDate` e normalizadas ao timezone de Recife quando possível.
