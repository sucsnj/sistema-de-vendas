# `src/services/notasService.ts`

> Cliente HTTP via `fetch` para o domínio de notas fiscais (endpoint interno `/api/notas`).

## O que faz

- Expõe `NotaDetalhe` (distribuidora, chave, data_emissao `YYYY-MM-DD`, valor_nota).
- Lista notas por período (`buscarNotasPorPeriodo`), busca por valor (`buscarNotaPorValor`), lista todas (`buscarTodasNotas`) e exclui (`excluirNota`).
- Retorna `null` em `buscarNotaPorValor` quando a API responde com status 404.

## Relações

- **Usa:** [`/api/notas`](../pages/api/notas.md)
- **Usado por:** páginas/fluxos que manipulam notas fiscais

## Notas

- `buscarNotaPorValor` envia `valor` via query string e trata 404 como "não encontrada".
- `data_emissao` é retornada como string (formato YYYY-MM-DD conforme API/DB).