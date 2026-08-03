export function getSearchMatches(items, query, fields = []) {
  const normalizedQuery = (query || '').trim().toLowerCase();
  if (!normalizedQuery) return [];

  return items.filter((item) =>
    fields.some((field) => {
      const value = item?.[field];
      return typeof value === 'string' && value.toLowerCase().includes(normalizedQuery);
    })
  );
}
