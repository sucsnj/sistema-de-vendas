# `src/components/ModalImportItens.tsx`

## Descrição

Modal de **importação de produtos via nota fiscal (XML de NF-e)** para o catálogo. Permite arrastar/selecionar um `.xml`, pré-visualizar os itens extraídos (modo `preview`), vincular cada item a um produto/serviço já cadastrado (ou editar/cadastrar rápido em nova aba) e importar em lote (modo `importar`). Apresentacional — a lógica está no hook `useImportItens`.

## Contexto

Usado em `src/pages/cadastro.tsx` (`ModalImportItens` com `onImportSuccess`/`initialFile`). O endpoint consumido é `POST /api/produtos/itens` (dois modos: `{ xml, preview: true }` e `{ importar: true, produto }`) — ver `docs/pages/api/produtos/itens.md` e as funções de serviço `previewInvoiceItems`/`importInvoiceItem` em `docs/services/produtosService.md`.

## Assinatura

```ts
interface ModalImportItensProps {
  onClose: () => void;
  onImportSuccess: () => void;
  initialFile?: File | null;   // arquivo já recebido ao abrir (drop externo)
}

const ModalImportItens: React.FC<ModalImportItensProps>;
```

## Responsabilidades

- **Upload**: dropzone (drag&drop + clique) e input `[type=file].xml` oculto.
- **Preview**: chama `useImportItens.processFile` → `previewInvoiceItems`; exibe loading/"Lendo nota fiscal…", erro em banner e a tabela de itens extraídos com contagem.
- **Vínculo**: coluna "Item no Sistema" usa `ItemNomeDropdown` (busca com sugestões); ações por item: "Editar item" (quando já vinculado) ou "Cadastro rápido" (novo), abrindo `/cadastro` com query string em nova aba.
- **Importação**: botão "Importar N produto(s)" roda o laço via `importInvoiceItem`; cada linha ganha status (`idle/ok/estoque_atualizado/duplicado/erro`); ao final mostra "resumo" de importação e chama `onImportSuccess` (recarrega listas do catálogo).
- **Fluxo de arquivo**: "Trocar arquivo" reseta itens/nome/erro/concluído (limpa o `input[type=file]`).

## Dependências

- `useImportItens` (`src/hooks/useImportItens`) — estado + ações (processamento, importação em lote, vínculo, resumo, reset).
- `ItemNomeDropdown` (`src/components/ItemNomeDropdown.tsx`) — seletor de item do sistema.
- `useFocusTrap` (`src/utils/focus`); estilos `styles/produtos.module.css` (chrome) e `styles/modalImport.module.css` (importação); ícones MUI.

## Observações

- **Comportamento preservado** da implementação original (módulo inicialmente misto, 587 linhas): na refatoração foram extraídos o hook `useImportItens`, o subcomponente `ItemNomeDropdown` e as funções de serviço `previewInvoiceItems`/`importInvoiceItem`; o tipo `ProdutoImportado` passou a viver em `produtosService.ts`.
- Identificadores internos renomeados para inglês (ADR 0004): `produtos`→`products`, `nomeArquivo`→`fileName`, `importando`→`importing`, `concluido`→`completed`, `erro`→`error`, etc.