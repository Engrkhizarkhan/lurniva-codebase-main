export function formatCurrency(value: number, currencySymbol = "Rs"): string {
  return `${currencySymbol}${value.toLocaleString("en-PK")}`;
}
