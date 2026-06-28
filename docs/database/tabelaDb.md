# `src/database/tabelaDb.ts`

## Descrição

Módulo de persistência para histórico de buscas na tabela de medicamentos. Usa `better-sqlite3` com banco `db/tabela.db`.

## Responsabilidades

- Criar tabela `tabela_search_history`.
- Armazenar consultas normalizadas e resultados em JSON.
- Recuperar histórico recente.
- Limpar histórico mantendo apenas as últimas 100 entradas.

## Funções Principais

- `findTabelaSearchHistory(normalizedQuery)`
- `saveTabelaSearchHistory(query, normalizedQuery, results)`
- `getRecentTabelaSearchHistory()`
- `clearTabelaSearchHistory()`
- `pruneTabelaSearchHistory()`

## Observações

- O módulo mantém o histórico restrito às 25 consultas mais recentes.
- Armazena resultados como JSON bruto, o que facilita o cache, mas pode ser pesado.
