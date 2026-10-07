# `src/utils/productUnits.ts`

## Descrição

**Regras puras das unidades de medida** do `FormularioProduto`. Centraliza as operações sobre a lista `unidadesMedida: { unidadeMedidaId, multiplicadorUnidade, principal }[]` e sincroniza os campos "resumo" `unidadeMedidaId`/`multiplicadorUnidade` quando a unidade afetada é a principal. Extraídas dos handlers inline no componente.

## Tipos

```ts
export interface UnitOfMeasureRow {
  unidadeMedidaId: number;
  multiplicadorUnidade: string;
  principal: boolean;
}

export interface UnitChangeResult {
  units: UnitOfMeasureRow[];
  unidadeMedidaId?: number;      // sync se a unidade alterada for a principal
  multiplicadorUnidade?: string;
}

export interface PrincipalUnitChangeResult {
  units: UnitOfMeasureRow[];
  unidadeMedidaId: number;       // sempre retornado
  multiplicadorUnidade: string;  // sempre retornado
}
```

## Funções

- `setUnitAsPrincipal(units, index): PrincipalUnitChangeResult` — marca `index` como principal (as demais `principal=false`). **Sempre** retorna `unidadeMedidaId` e `multiplicadorUnidade` da unidade selecionada (usado no `onChange` do radio).
- `updateUnitId(units, index, unidadeMedidaId): UnitChangeResult` — atualiza o `id` da unidade. Se essa unidade for **principal**, também retorna `unidadeMedidaId` para sincronizar `form.unidadeMedidaId`.
- `updateUnitMultiplier(units, index, multiplicadorUnidade): UnitChangeResult` — atualiza o multiplicador. Se principal, retorna `multiplicadorUnidade` para sincronizar `form.multiplicadorUnidade`.
- `removeUnit(units, index): UnitChangeResult` — remove a unidade `index`. Se era principal **e** restou pelo menos uma, a **primeira** restante passa a ser principal e retorna os campos sincronizados.
- `addUnit(units): UnitOfMeasureRow[]` — adiciona nova linha: `{ unidadeMedidaId: 1, multiplicadorUnidade: '1', principal: units.length === 0 }`.

## Observações

- Todas as funções são **imutáveis** (criando novos arrays/objetos).
- Contratos `UnitChangeResult` permitem ao chamador fazer `...(campo !== undefined ? { campo } : {})` ao atualizar `setForm` (evita sobrescrever com `undefined`), mas `PrincipalUnitChangeResult` é estrito (quando existe sincronia garantida — caso de selecionar a principal).
- Usadas pelo `FormularioProduto.tsx`; comportamento **preservado** em relação ao código inline anterior.