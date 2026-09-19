/**
 * src/utils/icons.ts
 *
 * Centraliza os ícones do lucide utilizados pela aplicação e a função que
 * os injeta no DOM (evita importar o objeto completo de ícones no bundle).
 */

import {
  createIcons,
  Check,
  CircleAlert,
  Copy,
  Download,
  Info,
  KeyRound,
  Printer,
  QrCode,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Wallet,
  type IconNode,
} from 'lucide';

const icons: Record<string, IconNode> = {
  Check,
  CircleAlert,
  Copy,
  Download,
  Info,
  KeyRound,
  Printer,
  QrCode,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Wallet,
};

/** Injeta os ícones `data-lucide` em todo o documento (ou em um elemento container especifico). */
export function initIcons(root?: HTMLElement | Document): void {
  createIcons({
    icons,
    nameAttr: 'data-lucide',
    ...(root && { root }),
  });
}