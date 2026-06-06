# `src/pages/api/vendas.ts`

## Descrição

API REST para operações de vendas diárias.

## Métodos

- `GET` - busca vendas por `mes` e `ano`.
- `POST` - insere nova venda; aceita `data`, `valor`, `observacoes` e `criado_em`.
- `PUT` - atualiza venda existente; valida limite de edição de até 2 dias.
- `DELETE` - exclui venda existente; valida limite de exclusão de até 2 dias.

## Observações

- A rota impede edição/exclusão fora do período de 2 dias.
- Retorna erros detalhados em JSON quando os dados são inválidos.
 - Validações de `data` e `valor` agora são centralizadas em `src/utils/validation.ts`.
 - `data` é validada usando `dayjs` no timezone de Recife (`America/Recife`) para consistência.
 - `valor` aceita textos numéricos (vírgula ou ponto) e é normalizado pela função `validateCurrency`.
