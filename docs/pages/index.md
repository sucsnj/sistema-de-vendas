# `src/pages/index.tsx`

## Descrição

Página principal do dashboard de vendas. Exibe resumo mensal, formulário de cadastro diário, gráficos e exportação de dados.

## Responsabilidades

- Carregar vendas diárias para o mês/ano selecionado.
- Controlar edição de vendas recentes.
- Consolidar o mês e acionar backup.
- Exibir notificações via `Toast`.
- Renderizar componentes:
  - `DailySaleForm`
  - `DailySalesTotal`
  - `SalesChart`
  - `ExportButtons`

## Funções Principais

- `loadSales()` - busca vendas do serviço e aciona a consolidação automática.
- `showToast()` / `closeToast()` - controla a barra de notificações.
- `handleConsolidate()` - dispara o endpoint de consolidação mensal.
- `handleBackup()` - dispara o backup do banco.
- `handleEditSale()` / `handleSaveEdit()` / `handleCancelEdit()` - fluxo de edição de vendas.
- `handleDeleteSale()` - exclui venda se estiver dentro do período editável.

## Dependências

- `src/services/vendasService`
- `src/components/*`
- `dayjs`
- `src/utils/captalize`
- `src/utils/edit`

## Observações

- A função `autoConsolidar()` roda após carregar vendas, mas não bloqueia a renderização.
- A edição de vendas é permitida apenas em vendas com até 2 dias de idade.
