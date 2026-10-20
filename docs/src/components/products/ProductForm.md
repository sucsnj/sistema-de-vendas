# `src/components/products/ProductForm.tsx`

> Formulário de cadastro/edição de produto; **exporta os tipos-chave do domínio**.

## O que faz

- Campos: Ativo, Nome, Descrição, Categoria/Marca/Fornecedor (select + "+" e "⋮"), preços/margem/estoque e unidades.
- Cálculo em tempo real de preço/margem (`parseNumber`, `calculateSalePrice`/`calculateMargin`).
- Em edição, Estoque vira botão "Ajustar" ([StockAdjustModal](./StockAdjustModal.md)); Código Interno fica `disabled`.

```ts
export interface ProdutoFormData {
  tipo: 'PRODUTO' | 'SERVICO'; nome: string; descricao: string;
  categoriaId: number; marcaId: number; fornecedorId: number;
  precoCompra: string; margemLucro: string; precoVenda: string;
  estoque: string; multiplicadorUnidade: string; unidadeMedidaId: number;
  codigoInterno: string; referencia: string; duracaoMinutos: string; ativo: number;
  unidadesMedida: { unidadeMedidaId: number; multiplicadorUnidade: string; principal: boolean }[];
}
// ProdutoOptions { categorias, marcas, fornecedores, unidadesMedida }; ProdutoActions: abrirModal*/editar*
```

## Relações

- **Usa:** `src/utils/productPrice.ts`, `productUnits.ts`, `number.ts`, `formatter.tsx`; modais de [catalog](../catalog/CategoryModal.md).
- **Usado por:** [ItemForm](./ItemForm.md), [ServiceForm](./ServiceForm.md) e hooks/páginas de catálogo.

## Notas

- Apresentacional: só renderiza e chama `setForm`; as regras de unidades vivem em `src/utils/productUnits.ts` (preço/margem viram número na validação).
