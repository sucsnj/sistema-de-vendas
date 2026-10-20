# `src/pages/produtos.tsx`

> Listagem de produtos e serviços (`/produtos`) com filtros, busca, paginação e controle de status.

## O que faz

- Busca `buscarProdutos` e `buscarServicos` (`pageSize: 10000`), mescla, ordena por nome e pagina localmente (10/página).
- Filtros: texto, tipo (`PRODUTO`/`SERVICO`/`TODOS`), categoria, marca, fornecedor e status (`ATIVO`/`INATIVO`/`TODOS`).
- Alterna status de produtos (`toggleStatusProduto`) e exclui com confirmação (`excluirProduto`/`excluirServico`).
- Navega para `/cadastro?id=X` ao editar; FAB "+" leva a `/cadastro`.

## Relações

- **Usa:** `produtosService`; componentes `ProductList`, `ProductFilters`, `ProductDeleteModal`.
- **Usado por:** consome `./api/produtos.md` e `./api/produtos/servicos.md`.

## Notas

- Serviços não têm marca/fornecedor/estoque: usam defaults (`marca_id: 1`, `fornecedor_id: 1`, `unidade_medida_id: 21`).
- Paginação ocorre no cliente; `toggleStatus` só se aplica a produtos.
