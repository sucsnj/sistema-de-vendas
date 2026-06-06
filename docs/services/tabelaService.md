# `src/services/tabelaService.ts`

## Descrição

Serviço de frontend para a tabela de medicamentos. Realiza upload de arquivo, busca de consulta e gerenciamento de histórico.

## Responsabilidades

- Enviar planilha XLSX para `/api/tabela`.
- Buscar resultados de pesquisa.
- Buscar histórico de pesquisas.
- Limpar histórico.
- Checar status da tabela carregada.

## Funções Principais

- `uploadTabela(formData)`
- `searchTabela(query)`
- `fetchTabelaHistory()`
- `clearTabelaHistory()`
- `fetchTabelaStatus()`

## Tipos

- `TabelaRow`
- `TabelaSearchHistoryItem`
- `TabelaSearchResponse`
- `TabelaStatusResponse`

## Observações

- A função `handleJsonResponse()` garante erro quando o backend retorna status não-ok.
- A API de tabela suporta cache de histórico para consultas repetidas.
