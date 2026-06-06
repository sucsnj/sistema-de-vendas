# `src/services/vendasService.ts`

## Descrição

Camada de serviço cliente para a entidade de vendas. Fornece funções assíncronas para CRUD de vendas e operações de consolidação.

## Responsabilidades

- Registrar vendas diárias no endpoint `/api/vendas`.
- Buscar vendas por mês/ano.
- Atualizar e excluir vendas.
- Buscar e consolidar totais mensais.
- Realizar backup do banco de vendas.
- Auto-consolidar o mês anterior quando necessário.

## Funções Principais

- `registrarVenda(data, valor, observacoes)`
- `registrarVendaComCriadoEm(data, valor, observacoes, criado_em)`
- `buscarVendasDiarias(mes, ano)`
- `atualizarVenda(id, data, valor, observacoes)`
- `excluirVenda(id)`
- `buscarTotalMensal(mes, ano)`
- `buscarTodosMensais()`
- `consolidarMensal(mes, ano)`
- `verificarConsolidado(mes, ano)`
- `autoConsolidar()`
- `excluirMensal(id)`
- `fazerBackup()`

## Dependências

- `src/utils/date` para lógica de data.
- API interna `/api/vendas`, `/api/mensais` e `/api/backup`.

## Observações

- `autoConsolidar()` tenta consolidar o mês anterior automaticamente se ainda não estiver consolidado.
- Tipos `VendaDiaria` e `VendaMensal` descrevem a forma de dados esperada.
