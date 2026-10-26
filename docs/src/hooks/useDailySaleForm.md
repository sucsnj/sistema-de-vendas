# `src/hooks/useDailySaleForm.ts`

> Hook que centraliza estado, validação, ações e efeitos do formulário de venda diária.

## O que faz

- Gerencia campos (`value`, `observations`), cálculo da expressão (`src/lib/calc/calculator.ts`), loading e estado do PIX (`pixModalOpen`, `pixPayload`, `pixAmount`).
- Integra carrinho via `useCart(showToast)`, sincroniza total do carrinho com campo (adiciona/remove `"+valor_carrinho"`).
- Handlers: `handleKeyDown` (filtro de teclas), `handleValueChange` (sanitiza), `handlePixClick` (valida e gera payload EMVCo), `handleSubmit` (valida, registra via `registerSale`, limpa/foca), `handleClear`, `addOperator(op)`.
- Efeitos: ESC limpa formulário, auto-foco/visibilidade do input e atualizações por carrinho.

## Relações

- **Usa:** `registerSale` (`src/services/vendasService.ts`), `useShortcuts` (`src/utils/shortcuts.ts`), `validateRequired/validateCurrency/validateDate` (`src/utils/validation.ts`), `highlightField` (`src/utils/forms.ts`), `parseCurrency` (`src/utils/number.ts`), `buildPixPayload` (`src/utils/pix.ts`), `src/lib/calc/calculator.ts`, `useCart`, `useToast`.
- **Usado por:** `src/components/sales/DailySaleForm.tsx` (apresentacional).

## Notas

- Identificadores renomeados ao tocar no módulo (ADR 0004): `valor`→`value`, `observacoes`→`observations`, `limpando`→`clearing`.
- Mantém refs para foco e navegação (`valueInputRef`, `observationsTextareaRef`, `formRef`).