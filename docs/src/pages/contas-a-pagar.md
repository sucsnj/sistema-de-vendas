# `src/pages/contas-a-pagar.tsx`

> Gestão de contas a pagar (`/contas-a-pagar`): cadastro, pagamento, filtros, importação XML, backup, agenda e resumo.

## O que faz

- Lista contas do mês (`buscarContas(ano, mes)`) e do ano (`buscarContas(ano)`); filtros por distribuidora, status e intervalo de vencimento (persistidos em `localStorage`).
- CRUD via `registrarConta`/`atualizarConta`/`excluirConta`; valida `distribuidora`, `valor` (> 0), `vencimento` e `documento`.
- Paga (`pagarConta`) e cancela pagamento (`cancelarPagamentoConta`); a observação é gravada via `atualizarConta` antes do pagamento.
- Importa XML NF-e via `fetch('/api/contas/import')`; backup via `fazerBackupContas`.

## Relações

- **Usa:** `contasService`; componentes `payables/*` e `summary/Summary`; utils `validation`, `number`, `forms`, `shortcuts`, `date`.
- **Usado por:** consome `./api/contas.md`, `./api/contas/import.md` e `./api/contas/backup.md`.

## Notas

- `filteredContas`/`ultimasContas` (memo) derivam de `contasAno`; Escape limpa o formulário.
- Duplicidade (distribuidora+documento) é rejeitada só na criação.
