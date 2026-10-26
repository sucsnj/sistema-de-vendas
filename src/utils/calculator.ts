/**
 * src/utils/calculator.ts
 *
 * Avaliação de expressões matemáticas do campo de valor das vendas.
 * Puro e desacoplado do React (sem estado, sem setState) — testável.
 */

import { calculateResult } from '@/lib/calc/calculator';

/**
 * Compatibility with the legacy calculation API: calculation now delegates
 * to `src/lib/calc/calculadora.ts`.
 */
export function evaluateExpression(input: string): number | null {
  return calculateResult(input);
}