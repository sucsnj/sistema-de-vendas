# `src/services/contasService.ts`

## Descrição

Serviços cliente para a gestão de contas a pagar. Encapsula chamadas para criação, busca, pagamento e backup de contas.

## Responsabilidades

- Registrar contas via `/api/contas`.
- Buscar contas por ano e mês.
- Atualizar contas existentes.
- Excluir contas.
- Marcar contas como pagas e cancelar pagamentos.
- Backup da base de contas.

## Funções Principais

- `registrarConta(...)`
- `importarContasXML(xml)`
- `buscarContas(ano, mes)`
- `pagarConta(id)`
- `cancelarPagamentoConta(id)`
- `atualizarConta(...)`
- `excluirConta(id)`
- `fazerBackupContas()`

## Tipos

- `ContaDetalhe` representa o registro de cada conta.

## Observações

- O backend precisa interpretar a ação `pagar` e `cancelar` no mesmo endpoint `/api/contas`.
- A interface confia em um formato estável de retorno JSON.
