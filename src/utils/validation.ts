import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configura dayjs com suporte a timezone e locale se necessário
dayjs.extend(utc);
dayjs.extend(timezone);
// Força uso do timezone de Recife (UTC-3) nas operações deste utilitário
const RECIFE_TZ = 'America/Recife';

/**
 * Valida e normaliza um email simples.
 * Retorna `true` se o email parecer válido, `false` caso contrário.
 * Não lança exceções.
 * @param email - string de email para validar
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Regex simples e permissivo suficiente para validações de frontend/backend leves
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(trimmed.toLowerCase());
}

/**
 * Valida e converte uma string que representa um valor monetário.
 * Aceita vírgulas como separador decimal e expressões numéricas simples já
 * que o projeto utiliza cálculos no campo de valor.
 * Retorna um número (float) quando válido ou `null` quando inválido.
 * @param value - string com representação de número (ex: "1.234,56" ou "1234.56")
 */
export function validateCurrency(value: string): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  // Normaliza: remove espaços, substitui vírgula por ponto e retira caracteres não numéricos exceto .-+
  const cleaned = String(value).trim().replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.\-+eE]/g, '');
  if (cleaned === '' || cleaned === '.' || cleaned === '-' || cleaned === '+') return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * Valida uma string de data e retorna um objeto Date no timezone de Recife.
 * Aceita formatos ISO e comuns produzidos pelo frontend (`YYYY-MM-DD`).
 * Retorna `Date` quando válido ou `null` quando inválido.
 * @param input - string representando uma data
 */
export function validateDate(input: string): Date | null {
  if (!input || typeof input !== 'string') return null;
  // Tenta parsear com dayjs no timezone de Recife
  const d = dayjs.tz(input, RECIFE_TZ);
  if (!d.isValid()) {
    // Tenta formato explícito YYYY-MM-DD
    const alt = dayjs.tz(input, 'YYYY-MM-DD', RECIFE_TZ);
    if (!alt.isValid()) return null;
    return alt.toDate();
  }
  return d.toDate();
}

/**
 * Checa se uma data (string ou Date) é editável conforme regra de negócio:
 * permite operações em vendas com diferença de até 2 dias em relação à data atual
 * no timezone de Recife.
 * @param dateInput - string ou Date representando a data a validar
 */
export function isEditableDate(dateInput: string | Date): boolean {
  const now = dayjs().tz(RECIFE_TZ).startOf('day');
  const d = typeof dateInput === 'string' ? dayjs.tz(dateInput, RECIFE_TZ) : dayjs(dateInput).tz(RECIFE_TZ);
  if (!d.isValid()) return false;
  const diffDays = now.diff(d.startOf('day'), 'day');
  return diffDays >= 0 && diffDays <= 2;
}

const validation = {
  validateEmail,
  validateCurrency,
  validateDate,
  isEditableDate,
};

export default validation;
