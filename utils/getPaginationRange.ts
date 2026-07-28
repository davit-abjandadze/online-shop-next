export type PaginationItem = number | "...";

export function getPaginationRange(current: number, total: number): PaginationItem[] {
  if (total <= 0) return [];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  pages.add(total - 1);
  pages.add(current - 1);
  pages.add(current);
  pages.add(current + 1);

  const valid = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: PaginationItem[] = [];
  let prev = 0;
  for (const p of valid) {
    if (prev && p - prev > 1) {
      result.push("...");
    }
    result.push(p);
    prev = p;
  }

  return result;
}
