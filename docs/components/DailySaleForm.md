# `src/components/DailySaleForm.tsx`

## Descrição

Componente de formulário usado na página principal para registrar vendas diárias. Também mostra histórico recente e permite operações de edição/exclusão.

## Contexto

Utilizado no Dashboard de Vendas para registrar vendas diárias.

## Responsabilidades

- Exibir campos de data, valor e observações.
- Permitir cálculos matemáticos no campo de valor (`+`, `-`, `*`, `/`).
- Chamar `registrarVenda()` do serviço de vendas.
- Mostrar mensagens com `Toast`.
- Exibir as últimas 4 vendas e ações rápidas de edição/exclusão.

## Props

- `sales` - lista de vendas atuais.
- `selectedDate` - data selecionada para registro.
- `onDateChange` - callback para atualizar data.
- `onSaleAdded` - callback após inserir venda.
- `onEditSale` - callback para iniciar edição.
- `onDeleteSale` - callback para excluir.
- `showHistory` - controla se o painel de histórico aparece.

## Dependências

- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).
- `useShortcuts` (captura de atalhos de teclado).
- `useFocusTrap` (mantém foco dentro do modal).
- `useEffect` (efeitos de renderização).
- `useRef` (referências persistentes).
- `useState` (estados de componente).

## Exemplo de uso

```tsx
<DailySaleForm
  sales={sales}
  selectedDate={selectedDate}
  onDateChange={onDateChange}
  onSaleAdded={onSaleAdded}
  onEditSale={onEditSale}
  onDeleteSale={onDeleteSale}
  showHistory={showHistory}
/>
```

## Observações

- Envia dados para `/api/vendas` via `src/services/vendasService`.
- Usa `expr-eval` para calcular expressões no campo de valor.
- Possui lógica de limpeza com `Escape` para limpar o campo.
