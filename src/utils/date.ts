import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pt-br';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

// TimeZones
const RECIFE_TZ = 'America/Recife';
const SAO_PAULO_TZ = 'America/Sao_Paulo';
const BRASILIA_TZ = 'America/Brasilia';

// TimeZone Selecionado
const TZ = RECIFE_TZ;

// Função utilitária para pegar o "agora"
export function now() {
  return dayjs().tz(TZ);
}

// Último dia do mês
export function getLastDayOfMonth(year: number, month: number): number {
  return dayjs(`${year}-${month}-01`).endOf('month').date();
}

// Função genérica para criar um objeto dayjs já com timezone
export function parseDate(value: string) {
  return dayjs.tz(value, TZ);
}

// Timestamp de um valor
export function toTimestamp(value: string): number {
  return parseDate(value).valueOf();
}

// Comparações
export function isAfter(a: string, b: string): boolean {
  return parseDate(a).isAfter(parseDate(b));
}

export function isBefore(a: string, b: string): boolean {
  return parseDate(a).isBefore(parseDate(b));
}

// toDate serve para transformar strings em Dates
export function toDate(value: string | Date): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // ISO sem horário
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = dayjs.tz(value, TZ);
      return d.isValid() ? d.toDate() : null;
    }

    // ISO com horário
    const iso = dayjs.tz(value, TZ);
    if (iso.isValid()) return iso.toDate();

    // DD-MM-YYYY
    const dmy = dayjs(value, 'DD-MM-YYYY').tz(TZ);
    if (dmy.isValid()) return dmy.toDate();
  }
  return null;
}

// Compatível com chamadas antigas, mas simplificado
export function toDateFromISO(value: string): Date | null {
  if (typeof value !== 'string') return null;
  const d = dayjs.tz(value, TZ);
  return d.isValid() ? d.toDate() : null;
}

// Arrays de data/hora
export function getDateArray(): [number, number, number] {
  const d = now();
  return [d.date(), d.month() + 1, d.year()];
}

// Mês Atual em texto
export function formatMonthName(month: number): string {
  return dayjs().month(month - 1).format('MMMM');
}

export function getTimeArray(): [number, number, number] {
  const d = now();
  return [d.hour(), d.minute(), d.second()];
}

export function getDateTimeArray(): [number, number, number, number, number, number] {
  const d = now();
  return [d.date(), d.month() + 1, d.year(), d.hour(), d.minute(), d.second()];
}

// Formatadores
export function formatDateString(
  value: string,
  format: string = 'DD/MM/YYYY'
): string {
  const d = dayjs.tz(value, TZ);
  return d.isValid() ? d.format(format) : '';
}

export function formatDateISO(
  value: string,
  format: string = 'DD/MM/YYYY'
): string {
  const d = dayjs.tz(value, TZ);
  return d.isValid() ? d.format(format) : '';
}

// Ano atual
export function getCurrentYear(): number {
  return now().year();
}
