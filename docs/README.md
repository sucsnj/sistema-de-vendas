# Documentação do Projeto

Este arquivo é o ponto de partida para navegar pela documentação do projeto. Aqui você encontra os principais documentos já existentes em `docs/` e em `docs/pages/api/`, organizados por categoria para facilitar o acesso.

## Sumário

- [Visão Geral](#visão-geral)
- [Páginas do Frontend](#páginas-do-frontend)
- [Referência de API](#referência-de-api)
- [Serviços](#serviços)
- [Banco de Dados](#banco-de-dados)
- [Componentes](#componentes)
- [Utilitários](#utilitários)

## Visão Geral

- [DOCS.md](DOCS.md) - documento de arquitetura geral do projeto, fluxo de dados, dependências críticas, riscos e sugestões de melhoria.

## Páginas do Frontend

- [pages/index.md](pages/index.md) - documentação da página principal do dashboard de vendas, incluindo resumo mensal, edição de vendas e backup.
- [pages/contas-a-pagar.md](pages/contas-a-pagar.md) - documentação da página de contas a pagar, filtros, importação de XML e gestão de pagamentos.
- [pages/historico.md](pages/historico.md) - documentação da página de histórico de vendas, listagem e busca de registros passados.
- [pages/resumo.md](pages/resumo.md) - documentação da página de resumo mensal de vendas e totais consolidados.
- [pages/tabela.md](pages/tabela.md) - documentação da página de upload e consulta de tabela de medicamentos.
- [pages/_app.md](pages/_app.md) - documentação da configuração global do app e integração com React Query.

## Referência de API

### Backup

- [pages/api/backup.md](pages/api/backup.md) - endpoint de backup do banco de dados principal.
- [pages/api/contas-backup.md](pages/api/contas/contas-backup.md) - endpoint de backup das contas a pagar.

### Financeiro

- [pages/api/vendas.md](pages/api/vendas.md) - API de CRUD de vendas diárias.
- [pages/api/notas.md](pages/api/notas.md) - API de consulta de notas fiscais.
- [pages/api/mensais.md](pages/api/mensais.md) - API de relatórios de vendas mensais.

### Importação e OCR

- [pages/api/ocr.md](pages/api/ocr.md) - endpoint de upload e processamento OCR.
- [pages/api/tabela.md](pages/api/tabela.md) - endpoint de cadastro e histórico de tabelas de vendas/importação.
- [pages/api/contas-import.md](pages/api/contas/contas-import.md) - endpoint de importação de contas a pagar via XML.

## Serviços

- [services/contasService.md](services/contasService.md) - documentação da camada de API cliente de contas a pagar.
- [services/notasService.md](services/notasService.md) - documentação da camada de API cliente de notas fiscais.
- [services/ocrService.md](services/ocrService.md) - documentação da camada de OCR e upload de arquivos.
- [services/pdfService.md](services/pdfService.md) - documentação da geração e exportação de PDFs.
- [services/tabelaService.md](services/tabelaService.md) - documentação da camada de serviço para tabelas de vendas.
- [services/vendasService.md](services/vendasService.md) - documentação da camada de API cliente de vendas diárias.

## Banco de Dados

- [database/db.md](database/db.md) - documentação da configuração e backup do banco SQLite principal.
- [database/contasDb.md](database/contasDb.md) - documentação da persistência de contas a pagar.
- [database/notasDb.md](database/notasDb.md) - documentação da persistência de notas fiscais.
- [database/tabelaDb.md](database/tabelaDb.md) - documentação da persistência de tabelas e histórico de importações.

## Componentes

- [components/Agenda.md](components/Agenda.md) - documento do componente de agenda e visualização de datas.
- [components/ConfirmDialog.md](components/ConfirmDialog.md) - documento do modal de confirmação.
- [components/ConsolidacaoMensal.md](components/ConsolidacaoMensal.md) - documento do componente de consolidação mensal de vendas.
- [components/ContasAPagarFilterPanel.md](components/ContasAPagarFilterPanel.md) - documento do painel de filtro de contas a pagar.
- [components/ContasAPagarForm.md](components/ContasAPagarForm.md) - documento do formulário de contas a pagar.
- [components/ContasAPagarLastTen.md](components/ContasAPagarLastTen.md) - documento do painel das últimas 10 contas.
- [components/ContasAPagarModals.md](components/ContasAPagarModals.md) - documento dos modais de contas a pagar.
- [components/DailySaleForm.md](components/DailySaleForm.md) - documento do formulário de venda diária.
- [components/DailySalesTotal.md](components/DailySalesTotal.md) - documento do painel de totais de vendas.
- [components/ExportButtons.md](components/ExportButtons.md) - documento dos botões de exportação de dados.
- [components/Nav.md](components/Nav.md) - documento da navegação global.
- [components/NotasDoMes.md](components/NotasDoMes.md) - documento do componente de notas do mês.
- [components/OcrUpload.md](components/OcrUpload.md) - documento do componente de upload OCR.
- [components/Resumo.md](components/Resumo.md) - documento do componente de resumo de vendas.
- [components/SalesChart.md](components/SalesChart.md) - documento do gráfico de vendas.
- [components/SalesTable.md](components/SalesTable.md) - documento da tabela de vendas.
- [components/TotaisPorDistribuidora.md](components/TotaisPorDistribuidora.md) - documento do painel de totais por distribuidora.

## Utilitários

- [utils/Utils.md](utils/Utils.md) - documento que descreve utilitários de formatação, parsing e limpeza de dados.

## Como usar este índice

1. Comece por `DOCS.md` para entender a arquitetura geral do projeto.
2. Acesse as páginas do frontend para entender cada rota principal.
3. Consulte a seção de API para detalhes dos endpoints internos.
4. Use as seções de serviços, banco de dados e componentes para entender a implementação por camada.
