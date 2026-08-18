export const PASS_NULL_DATE = '1801-01-01';
export const FUTURE_NULL_DATE = '2100-12-31';

export const PASS_NULL_DATETIME = '1801-01-01T00:00:00';
export const FUTURE_NULL_DATETIME = '2100-12-31T00:00:00';

export const PASS_NULL_MONTH = '1801-01';
export const FUTURE_NULL_MONTH = '2100-12';

export function toApiDateString(date: Date | string | null | undefined): string {
  if (!date) return '';

  const d: Date = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return '';

  const pad = (n: number, len: number = 2): string => String(n).padStart(len, '0');

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const SSS = pad(d.getMilliseconds(), 3);

  return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}`;
}

export function getCurrentDateTime(): string {

  const date: Date =  new Date();
  
  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}:` +
    `${pad(date.getSeconds())}`
  );
}

export const formatLocalDateTime = (date: Date | null): string | null => {
  if (!date) {
    return null;
  }

  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}:` +
    `${pad(date.getSeconds())}`
  );
};