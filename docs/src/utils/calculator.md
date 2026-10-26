# `src/utils/calculator.ts`

> Avaliação das expressões matemáticas digitadas no campo de valor das vendas.

## O que faz

- `evaluateExpression(input)` mantém compatibilidade e delega o cálculo para `src/lib/calc/calculadora.ts`.
- A referência principal de cálculo agora é `src/lib/calc/calculadora.ts`.

## Relações

- **Usa:** `src/lib/calc/calculadora.ts`.
- **Usado por:** `useDailySaleForm` (`../hooks/useDailySaleForm.md`).

## Notas

- Puro e desacoplado do React (sem estado) — testável.
