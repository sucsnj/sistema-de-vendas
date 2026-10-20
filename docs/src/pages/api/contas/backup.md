# `src/pages/api/contas/backup.ts`

> Backup do banco de contas a pagar (`db/contas.db`).

## O que faz

- `POST` sem corpo: chama `backupContasDatabase()` e responde `200 { message: 'Backup de contas criado', path }`.
- Erro → `500 { error: 'Erro no backup de contas' }`; outros métodos → `405` (`Allow: POST`).

## Relações

- **Usa:** `backupContasDatabase` de `src/database/contasDb.ts`.
- **Usado por:** `fazerBackupContas` em `contasService`; `../../contas-a-pagar.md`.

## Notas

- Backup diário por nome (sobrescreve o arquivo do mesmo dia); sem retenção automática.
