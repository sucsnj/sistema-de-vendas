# PROJECT_STATUS.md — Estado atual do projeto

> Fonte da verdade sobre o estado do projeto. Todo agente deve **ler antes de trabalhar** e **atualizar ao final de cada mudança de código**. Complementa `docs/CONTEXT.md` (contexto) e `docs/README.md` (índice).

Atualizado em: **08/10/2026**

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

### Limpeza de encoding: mojibake e BOM (08/10/2026)

- `node scripts/check-encoding.mjs` encontrou **82 problemas** em 9 arquivos: mojibake (UTF-8 interpretado como ANSI/cp1252 — acentos e travessões virando dois caracteres lixo) e BOM (U+FEFF) no início do arquivo — gerados por gravação via PowerShell (Windows-1252/ANSI).
- Reparados com `node scripts/check-encoding.mjs --fix`; segunda execução: **ENCODING OK** (nenhum mojibake, BOM ou caractere estranho).
- Arquivos corrigidos: `src/components/EditSaleForm.tsx`, `src/components/cart/{CartModal,CartModalShell,SelectItemsModal}.tsx`, `src/components/forms/ProductForm.tsx`, `src/components/import/{ImportItemsModal,ItemNameDropdown}.tsx`, `src/pages/{cadastro,index}.tsx`.
- Verificação: `npm run lint` e `npx tsc --noEmit` verdes.
- **Nova regra de agente**: proibido criar/gravar código via PowerShell — registrada em `AGENTS.md` (regra 5, "Framework e boas práticas") e `docs/CONTEXT.md` (regra 10).

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

### Adoção incremental do contrato `{ ok, message }` (ADR 0002)

- Hooks de cadastro (`useCategoria`, `useFornecedor`, `useMarca`, `useUnidadeMedida`): obrigatórios (nome/sigla) via `validateRequired`.
- `contas-a-pagar.tsx`: distribuidora, valor, vencimento e documento via `validateRequired`/`validateCurrency`; mantidas a regra de negócio "valor > 0" e a normalização com `parseNumber`.
- `cadastro.tsx`: nome do item, categoria, marca, fornecedor, unidade de medida e código de barras via `validateRequired`.
- `DailySaleForm.tsx`: valor (obrigatório/formato) e data via `validateRequired`/`validateCurrency`/`validateDate`; removido o uso direto de `toDate` no submit.
- `validation.ts`: novo `validateNumber` (números não monetários — transversal do ADR); ajuste de estoque do `cadastro.tsx` migrado para ele.
- **Decisão (opção A)**: regras de negócio (ex.: "valor > 0"), validação de IDs/parâmetros dos endpoints e toasts de carga/erro de API ficam **fora** do contrato — decisão documentada no ADR 0002.
- Lint, tsc e build verdes.

### Sessão de alinhamento (contexto do domínio)

- Criado `docs/ALIGNMENT.md` — guia de alinhamento (negócio, usuários, fluxos, pontos de atenção) para a futura refatoração, alimentado com o contexto do dono.
- Já registrado: estabelecimento (farmácia → expandido), origem do sistema, público-alvo (idosos, UX de "digitar valor + ENTER"), uso individual sem auth via Tailscale, rotina (registro de vendas é o fluxo principal) e invariantes que a refatoração não pode quebrar.
- Seções 2 (fluxos) e 3 (regras de domínio) ainda *aguardando contexto*.
- Índice (`docs/README.md`) e `docs/CONTEXT.md` atualizados com o novo doc.

### Fundações da refatoração — Fase 0 (utilitários compartilhados)

- Decisões do dono: começar pelas **fundações/utilitários**; direção de estilos **decidida depois**.
- Novos módulos em `src/utils/` (fonte única e descobrível, perfil de `ALIGNMENT.md` §4.5):
  - `clipboard.ts` — `copyToClipboard` extraído de `ActionPix.tsx` (API nativa + fallback `execCommand`).
  - `download.ts` — `downloadDataUrl` (extraído do `downloadQrPng`).
  - `productPrice.ts` — `calculateSalePrice`/`calculateMargin`: **regra de negócio** do catálogo que estava duplicada nos 3 handlers de preço do `FormularioProduto.tsx` (agora centralizada; import de `formatCurrencyNumber` removido do componente; renomeado de `produtoPreco.ts` para o padrão de nomenclatura em inglês — ADR 0004).
- Módulos não-UI movidos de `src/components/` para `src/utils/`: `QrPix.tsx` → `qrPix.ts` e `ActionPix.tsx` → `pixActions.ts` (comportamento preservado; `copyToClipboard` passou a vir de `clipboard.ts` e o download de `download.ts`).
- Importadores atualizados: `ModalPix.tsx` e `FloatingPixWindow.tsx` (`@/utils/qrPix`, `@/utils/pixActions`, `@/utils/clipboard`).
- **Achados (registrados para a próxima fase)**: `#toast-root` não é renderizado por nenhuma página → `pixActions.showToast` não exibe nada (bug latente; unificação de toasts é o próximo alvo); `FormPix.tsx` (`src/components/`) é módulo legado (DOM, `.tsx` sem JSX) **sem chamadas ativas** — candidato a remoção.
- Verificação: `npm run lint`, `npx tsc --noEmit` e `npm run build` verdes.
- Docs sincronizados: `docs/utils/Utils.md` (5 módulos novos + observações), `docs/components/Pix.md` (caminhos/assinaturas) e `docs/README.md` (índice).

### Unificação de toasts (ADR 0003)

- **Store singleton** `src/utils/toast.ts` (`showToast`, `dismissToast`, `subscribeToast`, `getToastSnapshot`/`getServerToastSnapshot`) como fonte única de notificações.
- `src/hooks/useToast.ts` reescrito para consumir o store via `useSyncExternalStore` (mesma API pública; funções estáveis seguras em deps de `useCallback`).
- **Host global** `src/components/Toaster.tsx` montado em `src/pages/_app.tsx` (uma única instância, posição `top-right`).
- Migradas 7 páginas (`index`, `historico`, `resumo`, `produtos`, `cadastro`, `contas-a-pagar`, `tabela`) e 2 componentes (`DailySaleForm`, `OcrUpload`) para `useToast()` — estado local e `<Toast>` por página removidos.
- `pixActions.showToast` (DOM) **removido**; `ModalPix`/`FloatingPixWindow` usam `showToast` do store — **corrige o bug** do toast PIX (`#toast-root` nunca era renderizado, toasts eram silenciosamente inexistentes).
- Decisão de UX (aprovada): toast da venda passa de `local-top-right` para `top-right` global.
- SSR: `getServerSnapshot` retornando estado inicial (nenhum toast no servidor; build de produção OK).
- Docs: `docs/components/Toast.md` (reescrito), `docs/hooks/Hooks.md`, `docs/utils/Utils.md`, `docs/components/Pix.md`, `docs/pages/_app.md`, `docs/README.md`, `docs/CONTEXT.md`, **novo ADR** `docs/adr/0003-padrao-de-notificacoes-toast.md`.
- **Novos padrões**: `docs/documentation-guidelines.md` (padrão de documentação, referenciado no `AGENTS.md`).
- Verificação: lint, tsc e build verdes.

### Padrão de nomenclatura (ADR 0004) e limpeza do legado

- Decisão do dono: identificadores, funções e nomes de arquivo em **inglês**; pt-BR apenas em strings visíveis ao usuário. Regra no `AGENTS.md` (boas práticas) + **novo ADR** `docs/adr/0004-padrao-de-nomenclatura-dos-identificadores.md`. Aplicação: gradual — código novo/refatorado em inglês; a renomeação do restante ocorre ao tocar nos módulos.
- `src/utils/productPrice.ts` renomeado para o novo padrão (antes `produtoPreco.ts`; ver acima).
- **`FormPix.tsx` removido** (legado sem chamadas ativas, decisão do dono); docs atualizados em `docs/components/Pix.md` e `docs/README.md`.

### Refatoração de `DailySaleForm` (primeiro componente grande)

- **`src/types/sale.ts` criado** — `CartItem`/`CatalogItemType` movidos do componente `DailySaleForm` para a camada de tipos (compartilhados por `useCart`, `ModalCarrinho`, `ModalSelecionarItens` e `DailySaleForm`/`EditSaleForm`); importadores atualizados (importação `type`).
- **`src/utils/calculator.ts` criado** — `evaluateExpression(input)` puro/testável (`expr-eval`) com a regra do campo de valor (vírgula→ponto, fallback sem o último operador).
- **`src/hooks/useDailySaleForm.ts` criado** — concentra estado/validação/ações/efeitos do formulário: filtro de teclas, sanitização do valor, sincronização com o total do carrinho, ESC/limpar, PIX, `handleSubmit` (cadeia de validação ADR 0002 → `registrarVenda` → limpeza/foco), auto-foco (1min/3min); usa `useCart(showToast)` e `evaluateExpression`.
- **`DailySaleForm.tsx` reescrito fino** (691 → ~417 linhas): apresentacional, apenas JSX + `<style jsx>` + ligação ao hook. **Comportamento preservado** (nenhuma regra alterada).
- **ADR 0004 aplicado no módulo**: `valor`→`value`, `observacoes`→`observations`, `limpando`→`clearing`, `estaVisivel`→`isVisible`, comentários/regra do `expr-eval` extraída.
- Docs: `docs/components/DailySaleForm.md` (reescrito), `docs/hooks/Hooks.md` (nova seção `useDailySaleForm` + nota do `CartItem`), `docs/types/Types.md` (nova seção `sale.ts`), `docs/components/ModalCarrinho.md` (origem do tipo), `docs/utils/Utils.md` (`calculator.ts`), `docs/README.md` (índice).
- Verificação: lint, tsc e build de produção verdes.

## Gravação de arquivos: nunca usar PowerShell

- **Proibido gravar/editar arquivos do projeto com cmdlets do PowerShell** (`Set-Content`, `Out-File`, `Add-Content` etc.): a codificação padrão do Windows (ANSI/cp1252) gera arquivos *válidos* em UTF-8 porém com os acentos de palavras como `mês` virados em dois caracteres lixo, e o estrago só aparece na tela — lint, typecheck e build passam normalmente.
- Sempre gravar em UTF-8 explícito (as ferramentas de edição do opencode gravam UTF-8).
- **Rede de segurança**: `node scripts/check-encoding.mjs` (relata e sai com exit 1) e `node scripts/check-encoding.mjs --fix` (repara mojibake/BOM inequívocos). Rodar antes de commitar; sem dependências (só `node:fs`/`node:path`).
- Caracteres legítimos (`—`, `–`, `…`, aspas curvas) não são afetados: o script é sensível ao contexto e não acusa texto bom.

## Pendentes

- Nenhuma pendência de lint/typecheck/build.
- **Melhorias futuras recomendadas (P2/P3 do DOCS.md)**: abstração de dados de tabela/histórico; tipagem forte de `fetch`; extrair XML/OCR de `contas/import.ts`; testes automatizados; transversais ainda não implementados do ADR (tamanho máximo de strings).
- **Refatoração (direção registrada em `docs/ALIGNMENT.md` seção 4)**: Fase 0 (fundações/utilitários), unificação de toasts (ADR 0003), padrão de nomenclatura (ADR 0004) e `DailySaleForm` extraído (hook `useDailySaleForm` + `utils/calculator` + `types/sale.ts`) concluídos. Próximos alvos:
  - **Grandes componentes** mistos (UI+estado+validação+API): `ModalCarrinho`, `ModalImportItens`, `FormularioProduto`, `ModalSelecionarItens` — extraídas hooks/serviços/subcomponentes (mesmo padrão de `DailySaleForm`).
  - **Renomeação incremental** dos identificadores pt-BR restantes para inglês (ADR 0004), ao tocar nos módulos.
  - **Decisão pendente do dono**: padronização de estilos (CSS Modules × classes globais × inline).
- Commit das mudanças atuais **não realizado** (por solicitação do usuário nesta rodada).

## Futuras / Melhorias sugeridas

- Renomeação incremental dos identificadores pt-BR restantes para inglês (ADR 0004) conforme os módulos forem tocados.
- Validação adicional em `npm run dev` para cenários não cobertos pelo teste crítico.
- Revisar formatação de exportação (`jspdf`/`xlsx`) para reforço visual, se desejado.
- Manter docs e `PROJECT_STATUS.md` alinhados a qualquer evolução de API ou regra.

## Como manter este arquivo

- **Sempre** que um agente fizer modificações de código: mover a mudança para "Últimas mudanças" (com data), ajustar "Pendentes"/"Futuras", e atualizar a data no topo.
- Atualizar também o doc correspondente em `docs/` (e `docs/README.md`/`CONTEXT.md` se necessário) antes de encerrar a tarefa.