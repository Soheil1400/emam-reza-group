const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const iranMobileRegex = /^(?:\+98|0098|98|0)?9\d{9}$/;

export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

export function normalizePhone(value: string) {
  const digits = normalizeDigits(value).replace(/\s|-/g, "");
  if (digits.startsWith("+98")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98")) return `0${digits.slice(2)}`;
  return digits;
}

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  if (emailRegex.test(trimmed)) return trimmed.toLowerCase();
  return normalizePhone(trimmed);
}

export function isValidIdentifier(value: string) {
  const normalized = normalizeIdentifier(value);
  return emailRegex.test(normalized) || iranMobileRegex.test(normalized);
}
