# `src/hooks/`

> Índice dos hooks do cliente em `src/hooks/`.

## Índice

| Arquivo | Resumo |
| --- | --- |
| [useBrand.md](./useBrand.md) | Gerencia marca (criação/edição/exclusão) no cadastro rápido. Exporta `useMarca`. |
| [useCart.md](./useCart.md) | Centraliza carrinho e catálogo de seleção (produtos/serviços), com debounce e totais. |
| [useCategory.md](./useCategory.md) | Gerencia categoria no cadastro rápido. Exporta `useCategoria`. |
| [useConfirmDialog.md](./useConfirmDialog.md) | Gerencia diálogo de confirmação de exclusão. |
| [useDailySaleForm.md](./useDailySaleForm.md) | Centraliza estado/validação/ações/efeitos do formulário de venda diária. |
| [useEscClose.md](./useEscClose.md) | Fecha modal/componente ao pressionar ESC enquanto aberto. |
| [useFilter.md](./useFilter.md) | Filtro do histórico com persistência em localStorage. |
| [useImportItems.md](./useImportItems.md) | Estado/lógica de importação de itens via XML de NF-e. |
| [useMonthlyData.md](./useMonthlyData.md) | Consolidações mensais (carregar/excluir). Exporta `useMensais`. |
| [useSales.md](./useSales.md) | Estado/ações de vendas diárias por período. Exporta `useVendas`. |
| [useSupplier.md](./useSupplier.md) | Gerencia fornecedor no cadastro rápido. Exporta `useFornecedor`. |
| [useToast.md](./useToast.md) | Estado/controles de toast via store singleton. |
| [useUnitOfMeasure.md](./useUnitOfMeasure.md) | Gerencia unidade de medida no cadastro rápido. Exporta `useUnidadeMedida`. |

## Notas

- Arquivos em inglês; identificadores exportados seguem em pt-BR (ex.: `useBrand.ts` → `useMarca`, `useSales.ts` → `useVendas`, `useCategory.ts` → `useCategoria`, `useMonthlyData.ts` → `useMensais`, `useSupplier.ts` → `useFornecedor`, `useUnitOfMeasure.ts` → `useUnidadeMedida`).