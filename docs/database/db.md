# `src/database/db.ts`

## Descrição

Módulo principal de banco de dados para vendas. Usa `better-sqlite3` para persistir vendas diárias e mensais em `db/vendas.db`.

## Responsabilidades

- Inicializar conexão SQLite.
- Criar tabelas `vendas_diarias` e `vendas_mensais`.
- Inserir, buscar, atualizar e excluir vendas diárias.
- Calcular métricas mensais e consolidar dados em `vendas_mensais`.
- Criar backup do banco de vendas.

## Funções Principais

- `insertDailySale(data, valor, observacoes, criado_em)`
- `getDailySales(mes, ano)`
- `getDailySaleById(id)`
- `updateDailySale(id, data, valor, observacoes)`
- `deleteDailySale(id)`
- `getVendasEsp(mes, ano)`
- `consolidateMonthly(mes, ano)`
- `getMonthlyTotal(mes, ano)`
- `getAllMonthly()`
- `deleteMonthly(id)`
- `backupDatabase()`

## Observações

- Usa `date-fns-tz` para gerar timestamp local em `America/Recife`.
- A lógica de cálculo de métricas está encapsulada em funções auxiliares locais.
- O backup grava arquivo `.db` no diretório db do projeto.
