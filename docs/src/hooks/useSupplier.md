# `src/hooks/useSupplier.ts`

> Hook para gerenciar criação, edição e exclusão de fornecedor no cadastro rápido. Exporta `useFornecedor`.

## O que faz

- Controla modais de cadastro (`modalFornecedorOpen`, `fornecedorForm`, `novoFornecedorNome`) e edição (`modalFornecedorEditOpen`).
- Cria fornecedor via `criarFornecedor`, atualiza `setOptions.fornecedores` e seleciona criado.
- Atualiza/exclui fornecedor, sincroniza opções, ajusta paginação/listagem e fecha modais.

## Relações

- **Usa:** `buscarFornecedores`, `criarFornecedor`, `deletarFornecedor`, `atualizarFornecedor` (`src/services/produtosService.ts`), `FornecedorFormData` (`src/components/catalog/SupplierEditModal`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** componentes de cadastro de produtos.

## Notas

- Arquivo `useSupplier.ts`; identificador exportado é `useFornecedor` (pt-BR).