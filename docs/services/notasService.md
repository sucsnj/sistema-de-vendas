# `src/services/notasService.ts`

## Descrição

Serviço cliente para notas fiscais. Permite buscar notas por período, por valor, listar todas e excluir.

## Responsabilidades

- Consultar notas em `/api/notas`.
- Buscar notas por ano/mês ou valor exato.
- Excluir notas pelo ID.

## Funções Principais

- `buscarNotasPorPeriodo(ano, mes)`
- `buscarNotaPorValor(valor)`
- `buscarTodasNotas()`
- `excluirNota(id)`

## Tipo

- `NotaDetalhe`

## Observações

- A rota `/api/notas` aceita `GET`, `POST` e `DELETE`.
- O serviço espera sempre retorno JSON válido do servidor.
