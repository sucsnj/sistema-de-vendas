# PROJECT_STATUS.md — Estado atual do projeto

> Fonte da verdade sobre o estado do projeto. Todo agente deve **ler antes de trabalhar** e **atualizar ao final de cada mudança de código**. Complementa `docs/CONTEXT.md` (contexto) e `docs/README.md` (índice).

Atualizado em: **22/09/2026**

## Resumo executivo

Sistema de gestão de vendas (Next.js 16 + React 19 + TypeScript + MUI + React Query + SQLite local). Estágio atual: **estável**. Lint, typecheck e build passam sem erros; as funcionalidades críticas (vendas do dia, histórico, contas a pagar, produtos/estoque, tabela de medicamentos, OCR) foram testadas manualmente sem problemas.

## Estado atual

| Checagem | Resultado |
| --- | --- |
| `npm run lint` | limpo (zero problemas) |
| `npx tsc --noEmit` | zero erros |
| `npm run build` | build de produção OK |
| Teste manual (funcionalidades críticas) | OK |

## Últimas mudanças

### Limpeza de lint: 188 problemas → 0 (etapas 1–10)

- **Etapas 1–7**: scripts (`run-next.mjs`), tipos, utilitários, persistência (`db.ts`, `contasDb`, `notasDb`, `tabelaDb`, `produtosDb`), hooks e APIs internas — eliminação de `any`, imports mortos, tipagens concretas e `catch {` sem parâmetro.
- **Etapa 8 (componentes)**: `BarcodeManager` (ref como prop separada de `data`), `ModalImportItens`, `ModalProdExclusao` e outros 4 modais (hooks antes do `return null`), `ModalServicos`, `Nav`/`SalesTable` (lazy initializers com guard de `window`), `DailySaleForm`.
- **Etapa 9 (páginas)**: `tabela`, `contas-a-pagar`, `produtos`, `cadastro` — `useCallback` + deferral `setTimeout(0)` para a regra `react-hooks/set-state-in-effect`, correções de `catch`, clamps de filtro movidos para handlers, imutabilidade em `codigosBarras`.
- **Etapa 10**: `npm run lint` zerado.

### Correções de tipo (descobertas no `tsc --noEmit`)

- `src/database/produtosDb.ts`: `ItemUnidadeData` com `sigla?`/`descricao?`; casts seguros em `barcodes`/`unidades_medida`.
- `src/pages/api/produtos/itens.ts`: casts dos `.get()`; variável `unidadeMedida` restaurada.
- `src/pages/api/tabela.ts`: `JSON.parse(... as string)`.
- `src/pages/api/vendas.ts`: interface local `ItemVendaApi` + normalização de itens (POST/PUT); import de `VendaItemInput` removido.
- `src/components/ContasAPagarModals.tsx`: `onSave` tipado como `(event: React.FormEvent<HTMLButtonElement>) => void`.

### Documentação

- `docs/components/BarcodeManager.md`, `docs/components/ContasAPagarModals.md`, `docs/pages/api/vendas.md`, `docs/database/produtosDb.md` atualizados.
- `AGENTS.md` com novas regras para agentes (documentação de mudanças, framework/boas práticas, conflito com regras).
- Criado este arquivo (`PROJECT_STATUS.md`).

### Limpeza de dependências sem uso

- Removidas do `package.json` (e `package-lock.json`/`node_modules` via `npm uninstall`): `date-fns-tz`, `lucide`, `lucide-react`, `papaparse`, `pdf-parse`, `pdf-poppler`; e `@types/papaparse` (dev).
- `@emotion/react` e `@emotion/styled` **mantidos**: são peer dependencies obrigatórias do `@mui/material` (usado via `Tooltip` e ícones).
- Removida a declaração órfã `src/types/pdf-poppler.d.ts` (o `pdfService.ts` usa `pdf2pic`, não `pdf-poppler`).
- Docs sincronizados: `docs/CONTEXT.md` (pilha principal), `docs/types/Types.md` e `docs/README.md`.

## Pendentes

- Nenhuma pendência de lint/typecheck/build.
- Nada commitado ainda.

## Futuras / Melhorias sugeridas

- Criar commit com as correções (quando o usuário solicitar).
- Validar os ícones `data-lucide` dos componentes PIX (`ActionPix`, `FloatingPixWindow`, `ModalPix`): dependiam do pacote `lucide` (removido) e nunca eram inicializados via `createIcons` — `<i>` vazios. Decidir entre inicializar o `lucide` de verdade ou trocar por `@mui/icons-material`/`lucide-react`.
- Validação adicional em `npm run dev` para cenários não cobertos pelo teste crítico.
- Revisar formatação de exportação (`jspdf`/`xlsx`) para reforço visual, se desejado.
- Manter docs e `PROJECT_STATUS.md` alinhados a qualquer evolução de API ou regra.

## Como manter este arquivo

- **Sempre** que um agente fizer modificações de código: mover a mudança para "Últimas mudanças" (com data), ajustar "Pendentes"/"Futuras", e atualizar a data no topo.
- Atualizar também o doc correspondente em `docs/` (e `docs/README.md`/`CONTEXT.md` se necessário) antes de encerrar a tarefa.