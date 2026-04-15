import Papa from "papaparse";

export async function parseCsv<T extends Record<string, string>>(content: string) {
  const headerCounts = new Map<string, number>();

  const parsed = Papa.parse<T>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader(header) {
      const key = header.trim();
      const count = (headerCounts.get(key) ?? 0) + 1;
      headerCounts.set(key, count);
      return count === 1 ? key : `${key}_${count}`;
    }
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message ?? "Unable to parse CSV");
  }

  return parsed.data;
}
