# `src/pages/api/contas/backup.ts`

## Descrição

Endpoint para fazer backup das contas a pagar.

## Métodos

- `POST` - gera arquivo de backup das contas usando `src/database/contasDb.ts`.

## Observações

- Destinado a salvar o estado atual das contas a pagar.
- Retorna o caminho do arquivo ou erro 500 em caso de problema.
