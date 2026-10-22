# `src/hooks/useSupplier.ts`

> Hook para gerenciar criação, edição e exclusão de fornecedor no cadastro rápido. Exporta `useSupplier`.

## O que faz

- Controla modais de cadastro (`supplierModalOpen`, `supplierForm`, `newSupplierName`) e edição (`supplierEditModalOpen`).
- Cria fornecedor via `createSupplier`, atualiza `setOptions.suppliers` e seleciona criado.
- Atualiza/exclui fornecedor, sincroniza opções, ajusta paginação/listagem e fecha modais.

## Relações

- **Usa:** `fetchSuppliers`, `createSupplier`, `deleteSupplier`, `updateSupplier` (`src/services/produtosService.ts`), `SupplierFormData` (`src/components/catalog/SupplierEditModal`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** componentes de cadastro de produtos.

## Notas

- Arquivo `useSupplier.ts`; identificador exportado é `useSupplier`.