# `src/components/BarcodeManager.tsx`

## Descrição

Gerência a adição e controle dos código de barras dos produtos adicionados ao sistema.

## Contexto

Ultilizado durante o cadastro e edição de produtos.

## Responsabilidades

- Adicionar código de barras.
- Editar código de barras.
- Excluir código de barras.

## Props

- `data` - dados do componente.
    - `codigosBarras` - códigos de barras do produto.
    - `novoCodigoBarras` - novo código de barras.
    - `inputRef` - ref do input.
- `actions` - ações do componente.
    - `adicionar` - adicionar código de barras.
    - `definirPrincipal` - definir código de barras como principal.
    - `alterar` - alterar código de barras.
    - `remover` - remover código de barras.

## Dependências

- `styles/produtos.module.css` (estilos).
- `src/services/produtosService.ts` (tipos e dados).
- `@mui/icons-material` (ícones).

## Exemplo de uso

```tsx
<BarcodeManager
  data={{
    codigosBarras,
    novoCodigoBarras,
    inputRef,
  }}
  actions={{
    adicionar,
    definirPrincipal,
    alterar,
    remover,
  }}
/>
```

## Observações

- Não permite a duplicação de códigos de barras.
- Não permite mais de um produto com o mesmo código de barras.
- Alguns estilos estão aplicados inline.