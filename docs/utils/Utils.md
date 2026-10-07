# `src/utils`

## Descrição

Pacote de utilitários usados em toda a aplicação para formatação, parsing e limpeza de dados.

## Módulos

- `captalize.tsx` - funções de capitalização de texto.
- `cleaner.tsx` - limpeza de arquivos temporários `temp`.
- `clipboard.ts` - cópia de texto para a área de transferência (API nativa + fallback `execCommand`): `copyToClipboard`.
- `date.ts` - datas em `America/Recife`: `now`, `parseDate` (Dayjs), `toDate` (Date), `toTimestamp`, formatadores e nomes de meses.
- `download.ts` - download de Data URL no navegador: `downloadDataUrl`.
- `edit.ts` - **regra de negócio** de edição de vendas com limite de 2 dias (`canEdit`) — fora do módulo de validação (ADR 0002).
- `formatter.tsx` - formatação de valores monetários.
- `forms.tsx` - manipulação de DOM/UI: realce de campo obrigatório (`highlightField`) e mostrar/ocultar campos — **sem lógica de validação** (ADR 0002).
- `number.ts` - parsing de números: `parseNumber` e `parseCurrency` (normalizadores desacoplados da validação).
- `pix.ts` - geração de payload PIX EMVCo (TLV, CRC16) e validação de chaves PIX (ver `docs/components/Pix.md`).
- `pixActions.ts` - ações do painel PIX (baixar PNG de alta resolução e imprimir folha) — movido de `src/components/ActionPix.tsx` (Fase 0 da refatoração); notificações via `utils/toast.ts` (o `showToast` DOM foi removido, ver ADR 0003).
- `productPrice.ts` - **regra de negócio** do catálogo: `calculateSalePrice` e `calculateMargin` (fonte única usada pelo `FormularioProduto`) — fora do módulo de validação (ADR 0002); renomeado de `produtoPreco.ts`/`calcular*` conforme ADR 0004.
- `qrPix.ts` - renderização de QR Code (`renderQr`, `generateHighResPng`, `pulseQr`, `QR_SIZE`) — movido de `src/components/QrPix.tsx` (Fase 0 da refatoração).
- `shortcuts.tsx` - atalhos de teclado.
- `toast.ts` - **store singleton de notificações** (`showToast`, `dismissToast`, `subscribeToast`, `getToastSnapshot`/`getServerToastSnapshot` para `useSyncExternalStore`) — ver ADR 0003.
- `validation.ts` - validações centralizadas de campos no contrato `{ ok, message }` (ADR 0002): `validateRequired`, `validateEmail`, `validateCurrency`, `validateNumber`, `validateDate`.

## Observações

- `date.ts` usa apenas `dayjs` (com plugin `utc`/`timezone` e locale pt-BR) no timezone `America/Recife`.
- `cleaner.tsx` é usado apenas no backend para remover arquivos temporários.
- `validation.ts` expõe **somente validação** `{ ok, message }` (mensagens pt-BR hardcoded); parsing e regras de negócio ficam em `number.ts`/`date.ts`/`edit.ts`/`productPrice.ts` (ver `docs/adr/0002-padrao-de-validacao-de-campos.md`).
- `clipboard.ts`, `download.ts` e `pixActions.ts` operam no DOM do navegador (só executados no cliente).
- `toast.ts` unificou o toast do app: substituiu o toast DOM baseado em `#toast-root` (bug latente — host nunca renderizado) e o estado local por página/componente (ver ADR 0003).
