const faNumberFormatter = new Intl.NumberFormat("fa-IR");

export function formatFaNumber(value: number | bigint) {
  return faNumberFormatter.format(value);
}

export function formatFaDate(
  dateValue: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
) {
  if (!dateValue) return "تاریخ نامشخص";
  const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "تاریخ نامشخص";
  return new Intl.DateTimeFormat("fa-IR", options).format(parsedDate);
}

export function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
