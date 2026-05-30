import { format } from 'date-fns';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pt-br';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // trata strings de data sem horário como UTC para evitar deslocamento de fuso horário
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const dateOnly = new Date(`${value}T00:00:00Z`);
      if (!isNaN(dateOnly.getTime())) return dateOnly;
    }

    // tenta ISO com horário
    const iso = new Date(value);
    if (!isNaN(iso.getTime())) return iso;

    // tenta DD-MM-YYYY
    const parts = value.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
  }
  return null;
}

export function formatDateString(value: string, format: 'DD-MM-YYYY' | 'DD/MM/YYYY') {
  const [year, month, day] = value.split('-');
  if (format === 'DD-MM-YYYY') return `${day}-${month}-${year}`;
  return `${day}/${month}/${year}`;
}

// Aceita apenas string ISO (YYYY-MM-DD)
function toDateFromISO(value: string): Date | null {
  if (typeof value !== 'string') return null;

  // Força interpretação como UTC para evitar variação de timezone
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateISO(
  value: string,
  format: 'DD/MM/YYYY' | 'DD-MM-YYYY' = 'DD/MM/YYYY'
): string {
  const date = toDateFromISO(value);
  if (!date) return '';

  const day = pad(date.getUTCDate());
  const month = pad(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatMonthName(
  month: number,
  style: 'long' | 'short' = 'long',
  locale = 'pt-BR'
): string {
  if (month < 1 || month > 12) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, { month: style }).format(
    new Date(0, month - 1)
  );
}

export function formatDate(
  value: string | Date,
  format: 'DD/MM/YYYY' | 'DD/MM/YYYY HH:mm' | 'DD-MM-YYYY' | 'DD-MM-YYYY HH:mm:ss' = 'DD/MM/YYYY'
): string {
  const date = toDate(value);
  if (!date) return '';

  const isDateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const day = pad(isDateOnly ? date.getUTCDate() : date.getDate());
  const month = pad((isDateOnly ? date.getUTCMonth() : date.getMonth()) + 1);
  const year = isDateOnly ? date.getUTCFullYear() : date.getFullYear();
  const hours = pad(isDateOnly ? date.getUTCHours() : date.getHours());
  const minutes = pad(isDateOnly ? date.getUTCMinutes() : date.getMinutes());
  const seconds = pad(isDateOnly ? date.getUTCSeconds() : date.getSeconds());

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'DD-MM-YYYY HH:mm:ss':
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// retorna um array com dia, mês e ano da data atual UTC-03:00
export function dateToArray(): [number, number, number] | null {
  const value = dayjs().tz('America/Recife').locale('pt-br').format('DD-MM-YYYY');

  const date = toDate(value);
  if (!date) return null;

  const isDateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const day = isDateOnly ? date.getUTCDate() : date.getDate();
  const month = (isDateOnly ? date.getUTCMonth() : date.getMonth()) + 1;
  const year = isDateOnly ? date.getUTCFullYear() : date.getFullYear();

  return [day, month, year];
}

export default {
  formatMonthName,
  formatDate,
  getCurrentYear,
};
