# `src/lib/calc/calculator.ts`

> Calculadora customizada do campo de valor de vendas.

## O que faz

- Validates and inserts keys (`insertKey`), deletes (`deleteKey`) and sanitizes expressions (`sanitizeExpression`).
- Evaluates expressions with precedence and parentheses (`calculate`/`calculateResult`).
- Usa `arredondarMoeda` de `engine.ts`.

## Relações

- **Usa:** `src/lib/calc/engine.ts`.
- **Usado por:** `src/hooks/useDailySaleForm.ts` e `src/utils/calculator.ts`.

## Notas

- É a referência principal de cálculo do formulário de venda diária.
