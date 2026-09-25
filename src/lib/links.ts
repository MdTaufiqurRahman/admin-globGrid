/** A `tel:` link for a number as it was typed: "+880 1700-000000" → "tel:+8801700000000". */
export function telHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
