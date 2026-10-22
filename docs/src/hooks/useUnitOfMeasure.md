# `src/hooks/useUnitOfMeasure.ts`

> Hook para gerenciar criação, edição e exclusão de unidade de medida no cadastro rápido. Exporta `useUnitOfMeasure`.

## O que faz

- Controla modais de cadastro (`unitOfMeasureModalOpen`, `uomForm`) e edição (`unitOfMeasureEditModalOpen`).
- Cria unidade via `createUnitOfMeasure` (valida `abbreviation` obrigatória), atualiza `setOptions.unitsOfMeasure` e seleciona criada.
- Atualiza/exclui unidade, sincroniza opções, ajusta paginação/listagem e fecha modais.
- Exporta tipos auxiliares `UnitOfMeasureFormData`, `UnitOfMeasureOptions`.

## Relações

- **Usa:** `fetchUnitsOfMeasure`, `createUnitOfMeasure`, `deleteUnitOfMeasure`, `updateUnitOfMeasure` (`src/services/produtosService.ts`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** componentes de cadastro de produtos.

## Notas

- Arquivo `useUnitOfMeasure.ts`; identificador exportado é `useUnitOfMeasure`.
- Validação: exige `abbreviation` não vazia na edição.