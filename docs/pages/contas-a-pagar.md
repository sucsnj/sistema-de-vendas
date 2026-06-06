# `src/pages/contas-a-pagar.tsx`

## Descrição

Página de gestão de contas a pagar. Permite cadastrar, editar, pagar, cancelar pagamento, excluir, filtrar e importar XML de contas.

## Responsabilidades

- Carregar dados de contas do mês e do ano.
- Controlar estado de filtros, edição e seleção de conta.
- Permitir backup de contas específicas.
- Oferecer importação de XML via `fetch('/api/contas/import')`.
- Renderizar painéis:
  - `ContasAPagarHeader`
  - `ContasAPagarFilterPanel`
  - `ContasAPagarForm`
  - `ContasAPagarLastTen`
  - `Agenda`
  - `Resumo`
  - `ContasAPagarModals`

## Funções Principais

- `loadContasMes()` / `loadContasAno()` - busca dados de API e atualiza o estado.
- `showToast()` - exibe mensagens de status.
- `handleSubmit()` - cadastra ou atualiza uma conta após validações simples.
- `handleEditar()` / `handleCancelarEdicao()` - manipula edição de formulário.
- `handleView()` - exibe detalhes em modal.
- `handleDelete()` / `handlePagar()` / `handleCancelarPagamento()` - ações de alteração de estado.
- `handleImportXML()` - faz upload de XML e importa duplicatas.

## Dependências

- `src/services/contasService`
- `src/components/*`
- `src/utils/number`
- `src/utils/date`
- `@tanstack/react-query`

## Observações

- O import XML faz parsing manual de NFe e é sensível a formatos específicos.
- O estado de filtros `filtroVencimentoDe`/`filtroVencimentoAte` é persistido em `localStorage`.
- Os modais são abertos via estado e tornam a interface mais dinâmica.
