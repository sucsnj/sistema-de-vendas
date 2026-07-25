# `src/components/FormularioProduto.tsx`

## Descrição

Componente responsável por gerenciar o formulário de criação e edição para produtos/serviços.

## Contexto

Utilizado para cadastrar e editar produtos/serviços.

## Responsabilidades

- Cadastrar produtos.
- Editar produtos.
- Validar formulário.
- Salvar produtos.
- Cancelar formulário.
- Calcular preço de venda.
- Atualizar estoque.
- Atualizar estoque.

## Props

- `data` - dados do componente.
    - `tipo` - tipo do produto/serviço.
    - `nome` - nome do produto/serviço.
    - `descricao` - descrição do produto/serviço.
    - `categoriaId` - id da categoria.
    - `marcaId` - id da marca.
    - `fornecedorId` - id do fornecedor.
    - `precoCompra` - preço de compra do produto/serviço.
    - `margemLucro` - margem de lucro do produto/serviço.
    - `precoVenda` - preço de venda do produto/serviço.
    - `estoque` - estoque do produto/serviço.
    - `unidadeMedidaId` - id da unidade de medida.
    - `codigoInterno` - código interno do produto/serviço.
    - `referencia` - referência do produto/serviço.
    - `ativo` - status do produto/serviço.
- `options` - opções do componente.
    - `categorias` - lista de categorias.
    - `marcas` - lista de marcas.
    - `fornecedores` - lista de fornecedores.
    - `unidadesMedida` - lista de unidades de medida.
- `actions` - ações do componente.
    - `abrirModalCategoria` - abrir modal de categoria.
    - `abrirModalMarca` - abrir modal de marca.
    - `abrirModalFornecedor` - abrir modal de fornecedor.
    - `abrirModalUnidadeMedida` - abrir modal de unidade de medida.
    - `abrirModalAjusteEstoque` - abrir modal de ajuste de estoque.
    - `editarCategoria` - editar categoria.
    - `editarMarca` - editar marca.
    - `editarFornecedor` - editar fornecedor.
    - `editarUnidadeMedida` - editar unidade de medida.

## Dependências

- `src/services/produtosService.ts` (tipos e dados).
- `src/utils/formatter.ts` (funções de formatação).
- `src/utils/number.ts` (funções de formatação de números).
- `styles/produtos.module.css` (estilos).
- `@mui/icons-material` (ícones).

## Exemplo de uso

```tsx
<FormularioProduto
editarProdutoId={editingId}
form={form}
setForm={setForm}
options={options}
setOptions={setOptions}
inputRef={nomeInputRef}
actions={actions}
/>
```

## Observações

- Alguns estilos estão aplicados inline.