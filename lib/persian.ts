const faNumberFormatter = new Intl.NumberFormat("fa-IR");

export function formatFaNumber(value: number | bigint) {
  return faNumberFormatter.format(value);
}

export function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
