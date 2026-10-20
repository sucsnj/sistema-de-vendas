# `src/utils/calculator.ts`

> Avaliação das expressões matemáticas digitadas no campo de valor das vendas.

## O que faz

- `evaluateExpression(input)` resolve expressões como `"10+5*2"`, convertendo vírgula em ponto decimal.
- Entrada vazia retorna `0`; expressão inválida retorna `null`.
- Se a expressão terminar em operador (`"10+"`), tenta avaliar sem o último caractere.

## Relações

- **Usa:** `expr-eval`.
- **Usado por:** `useDailySaleForm` (`../hooks/useDailySaleForm.md`).

## Notas

- Puro e desacoplado do React (sem estado) — testável.
