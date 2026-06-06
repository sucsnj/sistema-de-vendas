# `src/database/contasDb.ts`

## Descrição

Módulo de persistência para contas a pagar. Usa `better-sqlite3` com banco `contas.db`.

## Responsabilidades

- Criar tabela `contas_detalhes`.
- Inserir contas, buscar por período e atualizar registros.
- Excluir contas.
- Marcar contas como pagas ou pendentes.
- Criar backup da base de contas.

## Funções Principais

- `insertConta(distribuidora, valor, vencimento, documento, bancoObservacoes)`
- `getContasByPeriod(ano, mes)`
- `getContaById(id)`
- `getAllContas()`
- `updateConta(id, distribuidora, valor, vencimento, documento, bancoObservacoes)`
- `deleteConta(id)`
- `payConta(id)`
- `cancelPaymentConta(id)`
- `backupContasDatabase()`

## Observações

- A função `getContasByPeriod` usa `vencimento` para filtrar por mês ou ano.
- Os campos de status são strings fixas `Pendente` ou `Pago`.
