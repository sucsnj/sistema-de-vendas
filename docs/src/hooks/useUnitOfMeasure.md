# `src/hooks/useUnitOfMeasure.ts`

> Hook para gerenciar criação, edição e exclusão de unidade de medida no cadastro rápido. Exporta `useUnidadeMedida`.

## O que faz

- Controla modais de cadastro (`modalUnidadeMedidaOpen`, `uomForm`) e edição (`modalUnidadeMedidaEditOpen`).
- Cria unidade via `criarUnidadeMedida` (valida `sigla` obrigatória), atualiza `setOptions.unidadesMedida` e seleciona criada.
- Atualiza/exclui unidade, sincroniza opções, ajusta paginação/listagem e fecha modais.
- Exporta tipos auxiliares `UnidadeMedidaFormData`, `UnidadeMedidaOptions`.

## Relações

- **Usa:** `buscarUnidadesMedida`, `criarUnidadeMedida`, `deletarUnidadeMedida`, `atualizarUnidadeMedida` (`src/services/produtosService.ts`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** componentes de cadastro de produtos.

## Notas

- Arquivo `useUnitOfMeasure.ts`; identificador exportado é `useUnidadeMedida` (pt-BR).
- Validação: exige `sigla` não vazia na edição.