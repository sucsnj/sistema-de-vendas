# `src/database/notasDb.ts`

## Descrição

Módulo de persistência para notas fiscais. Usa `better-sqlite3` com banco `db/notas.db`.

## Responsabilidades

- Criar tabela `notas_detalhes`.
- Inserir notas com chave, distribuidora, data de emissão e valor.
- Consultar notas por ID, valor ou período.
- Excluir notas.
- Criar backup da base de notas.

## Funções Principais

- `insertNota(distribuidora, chave, dataEmissao, valorNota)`
- `getNotasById(id)`
- `getSumNotasByYear(ano)`
- `getNotasByValor(valor)`
- `getNotasByPeriod(ano, mes)`
- `getAllNotas()`
- `deleteNota(id)`
- `backupNotasDatabase()`

## Observações

- O módulo usa datas ISO e consultas SQL com `date()` para filtrar por período.
- A busca por valor retorna apenas uma nota exata.
