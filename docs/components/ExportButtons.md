# `src/components/ExportButtons.tsx`

## Descrição

Componente de botões para exportar vendas em XLSX/PDF e importar vendas de planilhas.

## Responsabilidades

- Exportar vendas do dia ou do mês para XLSX.
- Exportar tabela HTML para PDF.
- Importar arquivos XLSX e enviar registros para o serviço de vendas.
- Exibir mensagens via callback `onMessage`.

## Props

- `sales` - vendas atuais.
- `mes`, `ano`, `selectedDate` - contexto de exportação.
- `onMessage` - callback de notificação.
- `onImportCompleted` - callback após importação.

## Observações

- Usa `xlsx` dinamicamente para evitar importação no bundle inicial.
- Faz validação de data para importações por dia/mês.
- O PDF é gerado a partir de `html2canvas` e `jspdf`.
