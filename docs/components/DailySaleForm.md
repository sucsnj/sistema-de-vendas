# `src/components/DailySaleForm.tsx`

## Descrição

Formulário de **venda diária** usado na página principal (`/`). Componente **apresentacional**: a lógica (estado, validação, ações, efeitos) foi extraída para o hook `useDailySaleForm` (refatoração dos componentes grandes — ver `docs/hooks/Hooks.md`).

## Contexto

Utilizado no Dashboard de Vendas para registrar vendas diárias.

## Responsabilidades

- Renderizar os campos (data, valor com calculadora, observações) e botões (Registrar/Limpar, operadores `+ − × ÷`, carrinho, PIX).
- Ligar os controles ao hook `useDailySaleForm` (que valida, calcula a expressão, integra o carrinho e envia ao serviço).
- Renderizar os modais do fluxo: `ModalSelecionarItens` (catálogo), `ModalCarrinho` e `ModalPix`.

## Assinatura

```ts
interface DailySaleFormProps {
  sales?: VendaDiaria[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaleAdded?: () => void;
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
  showHistory?: boolean;
}

const DailySaleForm: React.FC<DailySaleFormProps>;
```

## Props

- `selectedDate` - data selecionada para registro.
- `onDateChange` - callback para atualizar data.
- `onSaleAdded` - callback após inserir venda.
- `sales`, `onEditSale`, `onDeleteSale`, `showHistory` - mantidos na assinatura para compatibilidade (hoje não usados pelo componente).

## Dependências

- `useDailySaleForm` (`src/hooks/useDailySaleForm.ts`) — toda a lógica de estado/ações.
- `formatCurrency` (`src/utils/formatter`) — exibição do valor calculado.
- `ModalCarrinho`, `ModalSelecionarItens`, `ModalPix` (PIX/QR).
- Ícones MUI (`AddShoppingCartIcon`, `QrCode2Icon`).

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

- `CartItem`/`CatalogItemType` (tipo do carrinho) foram movidos para `src/types/sale.ts` (compartilhados com `useCart`, `ModalCarrinho`, `ModalSelecionarItens` e `EditSaleForm`).
- O `<style jsx>` permanece no componente (decisão de padronização de estilos ainda pendente).
- O hook documenta as regras removidas daqui: filtro de teclas, `expr-eval` (via `evaluateExpression`), sincronização com o carrinho, PIX, ESC/limpar, auto-foco.