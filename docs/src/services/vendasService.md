# `src/services/vendasService.ts`

> Cliente HTTP via `fetch` para o domínio de vendas. Camada de serviço do cliente para comunicar interface com APIs internas (`/api/vendas`, `/api/venda-itens`, `/api/mensais`, `/api/backup`).

## O que faz

- Define interfaces: `VendaDiaria`, `VendaItemData`, `VendaItemInput`, `VendaMensal`.
- Vendas diárias: `registrarVenda(data, valor, observacoes?, itens?)`, `registrarVendaComCriadoEm` (uso exclusivo na importação XLSX), `buscarVendasDiarias(mes,ano,filtro)`, `atualizarVenda`, `excluirVenda`.
- Itens de venda: `buscarVendaItens(vendaId)` retorna array vazio se `!response.ok`.
- Mensais: `buscarTotalMensal`, `buscarTodosMensais`, `consolidarMensal`, `verificarConsolidado`, `autoConsolidar`, `excluirMensal`.
- Backup: `fazerBackup` (POST `/api/backup`).
- `autoConsolidar()` lê data atual via `getDateArray()` (`utils/date`), decide consolidação do mês anterior (regra: se dia==3 consolida; se já consolidado retorna; se dia>2 consolida) e chama `consolidarMensal`.

## Relações

- **Usa:** [`src/utils/date.ts`](../utils/date.md) (`getDateArray`), [`/api/vendas`](../pages/api/vendas.md), [`/api/venda-itens`](../pages/api/venda-itens.md), [`/api/mensais`](../pages/api/mensais.md), [`/api/backup`](../pages/api/backup.md)
- **Usado por:** páginas/componentes de vendas (Dashboard, Histórico, Resumo)

## Notas

- `registrarVendaComCriadoEm` aceita `criado_em` opcional para preservar timestamps na importação de planilhas.
- `verificarConsolidado` lê corpo como texto: retorna `false` se não ok, sem texto ou sem campo `total !== undefined`.
- `autoConsolidar` não faz nada se `getDateArray()` retornar valores inválidos.