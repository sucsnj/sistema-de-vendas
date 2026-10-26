/**
 * src/utils/calculator.ts
 *
 * Avaliação de expressões matemáticas do campo de valor das vendas.
 * Puro e desacoplado do React (sem estado, sem setState) — testável.
 */

import { calcularResultado } from '@/lib/calc/calculadora';

/**
 * Compatibilidade com o cálculo legado: a referência de cálculo agora é
 * `src/lib/calc/calculadora.ts`.
 */
export function evaluateExpression(input: string): number | null {
  return calcularResultado(input);
}