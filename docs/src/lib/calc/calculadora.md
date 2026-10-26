# `src/lib/calc/calculadora.ts`

> Calculadora customizada do campo de valor de vendas.

## O que faz

- Valida e insere teclas (`inserirTecla`), apaga (`apagarTecla`) e sanitiza expressões (`sanitizarExpressao`).
- Avalia expressões com precedência e parênteses (`calcular`/`calcularResultado`).
- Usa `arredondarMoeda` de `engine.ts`.

## Relações

- **Usa:** `src/lib/calc/engine.ts`.
- **Usado por:** `src/hooks/useDailySaleForm.ts` e `src/utils/calculator.ts`.

## Notas

- É a referência principal de cálculo do formulário de venda diária.
