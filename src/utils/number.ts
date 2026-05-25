export function parseNumber(value: any): number {
  if (value == null) return NaN;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.trim().replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

export default parseNumber;
