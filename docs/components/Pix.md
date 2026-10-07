# Componentes de PIX

Documenta o fluxo de pagamento via PIX: os utilitários `pix.ts`, `pixActions.ts` e `qrPix.ts` (em `src/utils/`), e os componentes React `FloatingPixWindow` e `ModalPix`.

> Observação: `FloatingPixWindow` e `ModalPix` são componentes React em `src/components/`. Já os módulos de PIX sem JSX vivem em `src/utils/`: `pix.ts` (payload/validação), `qrPix.ts` (QR Code) e `pixActions.ts` (ações) — movidos de `src/components/` na Fase 0 da refatoração.

---

## `src/utils/pix.ts`

### Descrição

Geração do **payload PIX estático** no padrão EMVCo (Manual PIX / BACEN): string TLV (Tag-Length-Value), CRC16-CCITT e validação de chaves PIX (CPF, CNPJ, e-mail, telefone, aleatória).

### Assinaturas

```ts
type KeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | 'unknown';

interface PixKeyValidationResult {
  type: KeyType;
  label: string;
  key: string;
  valid: boolean;
  error: string | null;
  ambiguous?: boolean;
  options?: Array<'cpf' | 'phone'>;
}

interface BuildPixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: string | null;
  txid?: string;               // default '***'
}

interface BuildPixPayloadResult {
  payload: string;             // payload final com CRC16
  fields: { key: string; name: string; city: string; amount: string | null; txid: string };
}

export function emv(id: string, value: string | number | null | undefined): string;
export function crc16(payload: string): string;                       // CCCCCCC-CCITT FAUX, poly 0x1021
export function normalizeText(value: string | null | undefined, maxLen: number): string;
export function validatePixKey(value: string | null | undefined, forcedType?: 'cpf' | 'phone' | null): PixKeyValidationResult;
export function isValidCpf(cpf: string | number): boolean;
export function isValidCnpj(cnpj: string | number): boolean;
export function amountToPayload(value: string | number | null | undefined): string | null;
export function buildPixPayload(params: BuildPixPayloadParams): BuildPixPayloadResult;
```

### Funções

- `emv(id, value)` - monta campo TLV: `id` + comprimento (2 dígitos) + valor.
- `crc16(payload)` - CRC16-CCITT (FALSE, polinômio `0x1021`, inicial `0xFFFF`), retorna 4 hex maiúsculos.
- `normalizeText(value, maxLen)` - remove acentos, CAIXA ALTA, saneia caracteres, limita tamanho.
- `validatePixKey(value, forcedType?)` - classifica e valida a chave. Retorna erro/tipo; para 11 dígitos numéricos marca `ambiguous` com opções `['cpf', 'phone']` (com `forcedType` pode-se obrigar CPF ou celular).
- `isValidCpf` / `isValidCnpj` - validação de dígitos verificadores.
- `amountToPayload(value)` - converte `"15,50"` → `"15.50"` (formato do campo 54). Retorna `null` se vazio/zero.
- `buildPixPayload({ pixKey, merchantName, merchantCity, amount, txid })` - monta o payload EMVCo (GUI `br.gov.bcb.pix`), adiciona `6304` + CRC16.

### Constantes de layout

`PAYLOAD_FORMAT_INDICATOR = '000201'`; categoria `52040000`; moeda `5303986` (BRL); país `5802BR`; nome máx. 25 chars; cidade máx. 15; valor máx. 13 dígitos; txid padrão `'***'`.

---

## `src/utils/qrPix.ts`

### Descrição

Renderização do QR Code via biblioteca `qrcode` + utilidades de exportação PNG de alta resolução e animação de entrada.

### Assinatura

```ts
export const QR_SIZE = 280;

export function renderQr(canvas: HTMLCanvasElement, payload: string, size?: number): Promise<void>;
export function generateHighResPng(payload: string, scale?: number): Promise<string>;  // scale default 12
export function pulseQr(target: HTMLElement | null): void;
```

### Observações

- `renderQr` usa `qrcode.toCanvas`; nível de correção de erro `'M'`, margem 2, cores `#0f172a`/`#ffffff`.
- `generateHighResPng` retorna Data URL PNG (`scale` 12 p/ alta resolução).
- `pulseQr` reinicia a animação CSS `.qr-anim` (força reflow via `getBoundingClientRect`).
- Constante `ERROR_CORRECTION` é compartilhada entre as funções.

---

## `src/utils/pixActions.ts`

### Descrição

Ações do painel PIX: baixar PNG de alta resolução e imprimir a folha do PIX. Notificações usam o **store global de toasts** (`src/utils/toast.ts`).

### Assinatura

```ts
export interface PrintSheetData {
  payload: string;
  name: string;
  bank: string;
  amount: string | null;
  key: string;
}

export async function downloadQrPng(payload: string): Promise<void>;
export async function printPixSheet(data: PrintSheetData): Promise<void>;
```

### Observações

- `copyToClipboard` vive em `src/utils/clipboard.ts` e o `showToast` em `src/utils/toast.ts` — ambos usados por `ModalPix`/`FloatingPixWindow` (toasts do PIX agora **são exibidos**, corrigindo o bug do antigo `#toast-root` — ver ADR 0003).
- `downloadQrPng` gera PNG via `generateHighResPng` (de `qrPix.ts`) e dispara download `pix-qrcode-YYYY-MM-DD.png` via `downloadDataUrl` (de `src/utils/download.ts`).
- `printPixSheet` desenha o QR no canvas `#print-canvas` (250×250, `errorCorrectionLevel: 'M'`), preenche `#print-*` e chama `window.print()` com `body.printing`.
- `formatBRL` (privada) formata `"15.00"` → `"R$ 15,00"`.

---

## `src/components/ModalPix.tsx`

### Descrição

Modal com o QR Code PIX para pagamento. É o fluxo usado no formulário de venda (`DailySaleForm`).

### Assinatura

```ts
interface ModalPixProps {
  isOpen: boolean;
  onClose: () => void;
  payload: string;
  merchantName: string;
  merchantBank: string;
  amount: string | null;
  pixKey: string;
}

const ModalPix: React.FC<ModalPixProps>;
```

### Cards da interface

- Cabeçalho fixo com título "QR Code PIX" e botão fechar (ESC/overlay).
- Corpo com scroll: `<canvas>` (`renderQr`) + dados (nome, banco, valor ou "Aberto", chave).
- Rodapé fixo: ações **Copiar**, **Baixar PNG**, **Imprimir** (`copyToClipboard`, `downloadQrPng`, `printPixSheet`).

### Observações

- Rendereza via `createPortal` no `document.body`; retorna `null` se fechado ou SSR.
- `useFocusTrap` mantém foco; ESC e clique no overlay fecham.
- Ao abrir: `renderQr` no canvas + `pulseQr` na animação; erro exibe toast.
- Regex do valor: `R$ {número}`; se `amount` nulo exibe "Aberto".

---

## `src/components/FloatingPixWindow.tsx`

### Descrição

Janela flutuante (draggable) com o QR Code PIX, alternativa ao `ModalPix`. Compartilha o mesmo conjunto de props/características.

### Assinatura

```ts
interface FloatingPixWindowProps {
  isOpen: boolean;
  onClose: () => void;
  payload: string;
  merchantName: string;
  merchantBank: string;
  amount: string | null;
  pixKey: string;
}

const FloatingPixWindow: React.FC<FloatingPixWindowProps>;
```

### Observações

- Renderizada via `createPortal`; retorna `null` se `!isOpen`.
- Janela arrastável: arrastar pelo cabeçalho (exceto botões) atualiza posição via listeners `mousemove`/`mouseup` (posição inicial `{x:100, y:100}`).
- Mesmas ações Copiar/Baixar PNG/Imprimir do `ModalPix`.

---

## Fluxo completo

1. `DailySaleForm` / `ModalPix` capturam chave/valor/nome/banco e validam a chave (`validatePixKey`).
2. `buildPixPayload` (`utils/pix.ts`) gera o payload EMVCo com CRC16.
3. `ModalPix` / `FloatingPixWindow` renderizam o QR via `qrPix.renderQr`.
4. Ações: `clipboard.copyToClipboard` (Copia e Cola), `pixActions.downloadQrPng` (PNG), `printPixSheet` (impressão).

## Integração

- `DailySaleForm` (página `/`) abre `ModalPix` com `pixPayload`/`pixAmount` gerados por `buildPixPayload` (ver `docs/components/DailySaleForm.md`).
- Hooks de catálogo/hooks de PIX não possuem doc específico além destes; ver `docs/hooks/Hooks.md`.