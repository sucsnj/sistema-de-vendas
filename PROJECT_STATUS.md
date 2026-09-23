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

### Padronização de validação de campos (entrevista `grill-with-docs`, ADR 0002)

- Entrevista concluída; decisões registradas em `docs/adr/0002-padrao-de-validacao-de-campos.md` (**status: aceito e implementado**).
- Contrato `{ ok, message }` (mensagens pt-BR hardcoded), consumo por campo, parsing desacoplado, `validateEmail` mantida e migrada ao contrato novo, `isEditableDate` consolidada em `canEdit`, escopo de campos: vendas, contas (incl. status), produtos, cadastros auxiliares e transversais (obrigatório, ids numéricos, tamanho, e-mail).
- Glossário ampliado (`docs/glossary.md`, seção "Padrões de validação"); índice `docs/README.md` e tabela "Tema → Documentos" do `docs/CONTEXT.md` atualizados.

### Implementação do ADR 0002 (código)

- `utils/validation.ts` reescrito como **validação pura**: `ValidationResult` (`{ ok, message }`), `validateRequired`, `validateEmail`, `validateCurrency`, `validateDate`; `isEditableDate` e parsing removidos.
- `utils/number.ts`: novo normalizador `parseCurrency` (preserva o comportamento do antigo `validateCurrency`, retorno `number | null`).
- Migração de call sites para normalizadores: `utils/date.ts`/`toDate` para datas e `parseCurrency` para valores em `src/pages/api/vendas.ts`, `src/pages/api/contas/import.ts` e `src/components/DailySaleForm.tsx`.
- Regra de 2 dias unificada: `isEditableDate` (validation.ts) substituída por `canEdit` (`utils/edit.ts`) na API de vendas — eliminada duplicidade.
- Verificação: `npm run lint`, `npx tsc --noEmit` e `npm run build` verdes.
- Docs sincronizados: `docs/utils/Utils.md` (módulos e observações) e `docs/CONTEXT.md` (regra 6 de validação).

### Ícones PIX migrados para `@mui/icons-material`

- Substituídos todos os ícones `data-lucide` (nunca renderizados, dependiam do pacote removido) por ícones MUI em `ModalPix.tsx`, `FloatingPixWindow.tsx` e no toast de `ActionPix.tsx`.
- `ModalPix.tsx`/`FloatingPixWindow.tsx`: `CloseIcon`, `ContentCopyIcon`, `FileDownloadIcon`, `PrintIcon`.
- `ActionPix.tsx`: o toast injeta SVG inline (via `innerHTML`), já que ícones MUI exigem React/JSX.

## Pendentes

- Nenhuma pendência de lint/typecheck/build.
- **Adoção incremental do contrato `{ ok, message }`**: os validadores existem no `validation.ts`; falta migrar os formulários/páginas que validam inline (produtos, cadastro, contas-a-pagar) e campos que ainda usam mensagens soltas (P2 da centralização).
- Nada commitado ainda.

## Futuras / Melhorias sugeridas

- Criar commit com as correções (quando o usuário solicitar).
- Validação adicional em `npm run dev` para cenários não cobertos pelo teste crítico.
- Revisar formatação de exportação (`jspdf`/`xlsx`) para reforço visual, se desejado.
- Manter docs e `PROJECT_STATUS.md` alinhados a qualquer evolução de API ou regra.

## Como manter este arquivo

- **Sempre** que um agente fizer modificações de código: mover a mudança para "Últimas mudanças" (com data), ajustar "Pendentes"/"Futuras", e atualizar a data no topo.
- Atualizar também o doc correspondente em `docs/` (e `docs/README.md`/`CONTEXT.md` se necessário) antes de encerrar a tarefa.