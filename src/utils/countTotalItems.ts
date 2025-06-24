/**
 * Counts the total number of items across multiple data entries
 */
export function countTotalItems(entries: { name: string; dataJSONL: string }[]): number {
  let totalItems = 0;

  for (const { dataJSONL } of entries) {
    if (dataJSONL) {
      totalItems += dataJSONL
        .split('\n')
        .filter((line) => line.trim()).length;
    }
  }

  return totalItems;
} 