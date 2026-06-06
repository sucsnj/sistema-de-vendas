# `src/pages/api/backup.ts`

## Descrição

Endpoint para criar backup do banco de vendas principal.

## Métodos

- `POST` - chama `backupDatabase()` em `src/database/db.ts` e retorna o caminho do arquivo criado.

## Observações

- Não aceita outros métodos.
- Retorna erro 500 em caso de falha.
