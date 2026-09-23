# Glossário do Sistema de Vendas

_Manter em pt-BR. Ampliar conforme a documentação avança — alimentado pelas skills `grill-with-docs` / `domain-modeling`._

## Vendas e Dashboard

| Termo | Definição |
| --- | --- |
| Venda diária | Registro de venda de um dia (data, valor, observações). |
| Item de venda | Produto/serviço de um carrinho, agregado a uma venda. |
| Carrinho | Conjunto de itens selecionados antes de confirmar a venda. |
| Consolidação mensal | Rotina que agrega as vendas do mês. |
| Backup | Cópia do banco de dados local gerada sob demanda. |

## PIX

| Termo | Definição |
| --- | --- |
| PIX | Meio de pagamento instantâneo; exibido como QR code na venda. |
| Payload PIX (BR Code) | String gerada para o QR code, via utilitário PIX. |

## Cadastro / Catálogo

| Termo | Definição |
| --- | --- |
| Catálogo | Conjunto de produtos e serviços cadastrados (produtos.db). |
| Estoque | Quantidade disponível de um produto, movimentada por entrada/saída. |

## Contas a pagar

| Termo | Definição |
| --- | --- |
| Conta a pagar | Despesa com distribuidora, valor, vencimento e status (Pago/Pendente). |