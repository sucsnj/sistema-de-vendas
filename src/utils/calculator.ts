/**
 * src/utils/calculator.ts
 *
 * Avaliação de expressões matemáticas do campo de valor das vendas.
 * Puro e desacoplado do React (sem estado, sem setState) — testável.
 */

import { Parser } from 'expr-eval';

/**
 * Avalia uma expressão matemática digitada no campo de valor.
 *
 * - input vazio → `0`;
 * - vírgulas são convertidas em pontos (separador decimal pt-BR);
 * - se a expressão terminar em operador (ex.: "10+"), tenta avaliar sem o
 *   último operador (comportamento do formulário de venda);
 * - retorna `null` quando não é possível avaliar.
 */
export function evaluateExpression(input: string): number | null {
  if (!input.trim()) return 0;

  const evaluate = (expr: string): number | null => {
    const result = new Parser().evaluate(expr);
    return typeof result === 'number' && !isNaN(result) ? result : null;
  };

  try {
    return evaluate(input.replace(/,/g, '.'));
  } catch {
    const expression = input.replace(/,/g, '.');
    const lastChar = expression.slice(-1);
    if (/[+\-*/]$/.test(lastChar)) {
      try {
        return evaluate(expression.slice(0, -1));
      } catch {
        return null;
      }
    }
    return null;
  }
}