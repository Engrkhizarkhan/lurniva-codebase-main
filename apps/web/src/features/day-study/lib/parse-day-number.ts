/** Parses a route param into a valid day number, or null if malformed. */
export function parseStringNumber(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}
