export function sortByName<T>(items: T[], getLabel: (item: T) => string): T[] {
  return [...items].sort((a, b) =>
    getLabel(a).localeCompare(getLabel(b), 'es', { sensitivity: 'base' }),
  );
}