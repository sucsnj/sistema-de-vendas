# `src/hooks/useBrand.ts`

> Hook para gerenciar criação, edição e exclusão de marca no cadastro rápido de produtos. Exporta `useMarca`.

## O que faz

- Controla modais de cadastro (`modalMarcaOpen`, `novaMarcaNome`) e edição (`modalMarcaEditOpen`, `marcaForm`) de marca.
- Cria marca via `criarMarca`, atualiza opções e seleciona a marca criada.
- Atualiza/exclui marca e sincroniza lista de opções do formulário.

## Relações

- **Usa:** `buscarMarcas`, `criarMarca`, `deletarMarca`, `atualizarMarca` (`src/services/produtosService.ts`), `validateRequired` (`src/utils/validation.ts`).
- **Usado por:** componentes de cadastro de produtos (modal de marca).

## Notas

- Arquivo `useBrand.ts`; identificador exportado é `useMarca` (convenção pt-BR).