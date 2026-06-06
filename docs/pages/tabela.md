# `src/pages/tabela.tsx`

## Descrição

Página de upload e pesquisa de tabela de medicamentos. Permite o upload de arquivo XLSX, busca rápida e controle de histórico.

## Responsabilidades

- Carregar status da tabela e histórico de pesquisas.
- Enviar planilha para processamento no backend.
- Realizar buscas por texto e exibir resultados.
- Limpar histórico de pesquisa.
- Exibir status de carregamento e avisos via `Toast`.

## Funções Principais

- `loadSearchHistory()` - busca histórico de pesquisas da API.
- `loadTabelaStatus()` - verifica se existe tabela carregada.
- `handleFileUpload()` - envia XLSX para `/api/tabela`.
- `performSearch()` / `handleSearch()` - realiza a pesquisa.
- `handleHistoryClick()` - busca usando entrada de histórico.
- `handleClearHistory()` - limpa o histórico cadastrado.

## Dependências

- `src/services/tabelaService`
- `src/components/Toast`
- `src/styles/contas.module.css`
- `src/utils/number`

## Observações

- O upload utiliza `FormData` e aceita `.xlsx` e `.xls`.
- A API de tabela utiliza um cache local de histórico no banco SQLite.
- A busca em histórico é diferenciada da busca em tabela para melhor performance.
