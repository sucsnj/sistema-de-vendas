# `src/components/ContasAPagarLastTen.tsx`

## Descrição

Exibe as últimas 10 contas registradas para visão rápida e ações realizadas.

## Contexto

Utilizado no Contas a Pagar para exibir as contas mais recentes.

## Responsabilidades

- Renderizar tabela compacta com vencimento, distribuidora e valor.
- Oferecer ações de ver, excluir e editar para cada linha.
- Confirmar exclusão com diálogo.

## Props

- `ultimasContas` - lista das contas mais recentes.
- `handleView`, `handleDelete`, `handleEditar`.

## Dependências

- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).
- `ConfirmDialog` (modal de confirmação).

## Exemplo de uso

```tsx
<ContasAPagarLastTen
  ultimasContas={ultimasContas}
  handleView={handleView}
  handleDelete={handleDelete}
  handleEditar={handleEditar}
/>
```

## Observações

- Usa `ConfirmDialog` para segurança antes de excluir.
- Ideal para navegação rápida entre registros recentes.
- Limita a quantidade de contas exibidas para o mesmo mês.
