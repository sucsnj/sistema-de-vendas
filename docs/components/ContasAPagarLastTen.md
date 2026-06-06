# `src/components/ContasAPagarLastTen.tsx`

## Descrição

Exibe as últimas 10 contas registradas para visão rápida e ações realizadas.

## Responsabilidades

- Renderizar tabela compacta com vencimento, distribuidora e valor.
- Oferecer ações de ver, excluir e editar para cada linha.
- Confirmar exclusão com diálogo.

## Props

- `ultimasContas` - lista das contas mais recentes.
- `handleView`, `handleDelete`, `handleEditar`.

## Observações

- Usa `ConfirmDialog` para segurança antes de excluir.
- Ideal para navegação rápida entre registros recentes.
