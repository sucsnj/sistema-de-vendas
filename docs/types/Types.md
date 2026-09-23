# Tipos (`src/types/`)

## Descrição

Tipos compartilhados entre camadas (páginas, componentes, serviços e API) que não pertencem a um único módulo. Muitos tipos do projeto vivem **dentro** de `src/services/*.ts` (ex.: `NotaDetalhe`, `TabelaRow`, `ProdutoFormData`), e não aqui.

## Arquivos

### `categoria.ts`

```ts
interface CategoriaFormData {
  nome: string;
  descricao: string;
}

interface CategoriaOptions {
  abrirModalCategoria: () => void;
  salvarCategoria: React.FormEventHandler<HTMLFormElement>;
}
```

- `CategoriaFormData`: payload de criação/edição de categoria.
- `CategoriaOptions`: contrato injetado em `ModalCategoria`/`ModalCategoriaEdit` (abrir modal e salvar), usado pela página `cadastro.tsx`.

### `pdf-poppler.d.ts`

```ts
declare module "pdf-poppler" {
    const pdf: any;
    export = pdf;
}
```

- Declaração **ambient** do módulo `pdf-poppler` (usado em `pdfService.ts`), porque a lib não entrega tipos próprios em runtime.
- Declara `pdf` como `any` — exceção pontual à regra de "sem `any`" do projeto.

## Observações

- Convenção: tipos de domínio coesos ficam nos services (ex.: `NotaDetalhe` em `notasService.ts`, `TabelaRow` em `tabelaService.ts`); `src/types/` guarda apenas o que é compartilhado entre camadas distintas.
- `pdf-poppler.d.ts` é um tipo inventado à mão — se a lib for substituída, a declaração sai junto.