# `src/services/tabelaService.ts`

> Cliente HTTP via `fetch` para o domínio da Tabela de Medicamentos (endpoint interno `/api/tabela`).

## O que faz

- Expõe interfaces: `TabelaRow`, `TabelaSearchHistoryItem`, `TabelaSearchResponse`, `TabelaStatusResponse`.
- Centraliza tratamento de resposta com `handleJsonResponse(response)` (lança `Error` com `json.error` se `!response.ok`).
- Realiza upload de arquivo (`uploadTabela` via `FormData` POST), busca (`searchTabela` com `query` codificada), histórico (`fetchTabelaHistory`), limpa histórico (`clearTabelaHistory` DELETE) e consulta status (`fetchTabelaStatus`).

## Relações

- **Usa:** [`/api/tabela`](../pages/api/tabela.md)
- **Usado por:** página [`/tabela`](../pages/tabela.md) e componentes relacionados

## Notas

- `searchTabela` aplica `encodeURIComponent(query.trim())` na URL.
- `fetchTabelaHistory` chama `?history=1`; `fetchTabelaStatus` chama `?status=1`.