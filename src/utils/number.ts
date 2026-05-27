export function parseNumber(value: any): number {
  if (value == null) return NaN;

  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    let cleaned = value.trim();

    // Se tiver vírgula, assume padrão BR
    if (cleaned.includes(',')) {
      cleaned = cleaned
        .replace(/\./g, '') // remove milhar
        .replace(',', '.'); // decimal
    }

    const n = parseFloat(cleaned);

    return Number.isFinite(n) ? n : NaN;
  }

  return NaN;
}

export default parseNumber;
