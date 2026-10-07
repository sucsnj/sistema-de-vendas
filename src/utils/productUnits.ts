/**
 * src/utils/productUnits.ts
 *
 * Regras puras das unidades de medida do formulário de produto
 * (seleção de principal, atualização e remoção com sincronização dos
 * campos "resumo" unidadeMedidaId/multiplicadorUnidade).
 * Extraídas dos handlers inline de `FormularioProduto` (ver docs).
 */

export interface UnitOfMeasureRow {
  unidadeMedidaId: number;
  multiplicadorUnidade: string;
  principal: boolean;
}

/** Resultado de uma operação sobre a lista de unidades de medida. */
export interface UnitChangeResult {
  units: UnitOfMeasureRow[];
  /** Sync de `unidadeMedidaId` quando a unidade alterada é a principal. */
  unidadeMedidaId?: number;
  /** Sync de `multiplicadorUnidade` quando a unidade alterada é a principal. */
  multiplicadorUnidade?: string;
}

/** Resultado da seleção de unidade principal (sempre sincroniza os campos de resumo). */
export interface PrincipalUnitChangeResult {
  units: UnitOfMeasureRow[];
  unidadeMedidaId: number;
  multiplicadorUnidade: string;
}

/** Marca a unidade `index` como principal (as demais deixam de ser). */
export function setUnitAsPrincipal(
  units: UnitOfMeasureRow[],
  index: number
): PrincipalUnitChangeResult {
  const next = units.map((unit) => ({ ...unit, principal: false }));
  next[index] = { ...next[index], principal: true };
  return {
    units: next,
    unidadeMedidaId: next[index].unidadeMedidaId,
    multiplicadorUnidade: next[index].multiplicadorUnidade,
  };
}

/** Atualiza o id da unidade `index` (sincroniza se for a principal). */
export function updateUnitId(
  units: UnitOfMeasureRow[],
  index: number,
  unidadeMedidaId: number
): UnitChangeResult {
  const next = [...units];
  next[index] = { ...next[index], unidadeMedidaId };
  const result: UnitChangeResult = { units: next };
  if (units[index].principal) {
    result.unidadeMedidaId = unidadeMedidaId;
  }
  return result;
}

/** Atualiza o multiplicador da unidade `index` (sincroniza se for a principal). */
export function updateUnitMultiplier(
  units: UnitOfMeasureRow[],
  index: number,
  multiplicadorUnidade: string
): UnitChangeResult {
  const next = [...units];
  next[index] = { ...next[index], multiplicadorUnidade };
  const result: UnitChangeResult = { units: next };
  if (units[index].principal) {
    result.multiplicadorUnidade = multiplicadorUnidade;
  }
  return result;
}

/** Remove a unidade `index`; se era a principal, a primeira restante assume. */
export function removeUnit(
  units: UnitOfMeasureRow[],
  index: number
): UnitChangeResult {
  const next = units.filter((_, i) => i !== index);
  const result: UnitChangeResult = { units: next };
  if (units[index]?.principal && next.length > 0) {
    next[0] = { ...next[0], principal: true };
    result.unidadeMedidaId = next[0].unidadeMedidaId;
    result.multiplicadorUnidade = next[0].multiplicadorUnidade;
  }
  return result;
}

/** Adiciona uma nova unidade (default `unidadeMedidaId: 1`, fator `1`). */
export function addUnit(units: UnitOfMeasureRow[]): UnitOfMeasureRow[] {
  return [
    ...units,
    { unidadeMedidaId: 1, multiplicadorUnidade: '1', principal: units.length === 0 },
  ];
}