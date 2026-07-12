# `src/components/ExportButtons.tsx`

## Descrição

Componente de botões para exportar vendas em XLSX/PDF e importar vendas de planilhas.

## Contexto de Uso

Este componente é utilizado em conjunto com os botões de exportação e importação, que estão localizados acima do calendário. Os botões estão agrupados em duas categorias: "Exportação" e "Importação", e estão localizados em um card com título "Ações".

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

## Exemplo de Uso

```tsx
<ExportButtons
  sales={vendas}
  mes={mes}
  ano={ano}
  selectedDate={selectedDate}
  onMessage={handleMessage}
  onImportCompleted={handleImportCompleted}
/>
```

## Observações

- Usa `xlsx` dinamicamente para evitar importação no bundle inicial.
- Faz validação de data para importações por dia/mês.
- O PDF é gerado a partir de `html2canvas` e `jspdf`.
