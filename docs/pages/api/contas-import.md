# `src/pages/api/contas/import.ts`

## Descrição

Endpoint para importar contas a pagar via XML.

## Métodos

- `POST` - processa XML enviado e adiciona registros de contas a pagar.

## Observações

- O frontend usa este endpoint para importar arquivos de notas fiscais.
- A importação valida campos obrigatórios e salva na base local.
