export function normalizeSearchText(value = '') {
  return String(value || '').toLowerCase().trim();
}

export function filterOffersByQuery(offers = [], query = '') {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return offers.filter((offer) => {
    const title = normalizeSearchText(offer?.titre);
    const company = normalizeSearchText(offer?.nomEntreprise || offer?.entreprise || offer?.company);
    const location = normalizeSearchText(offer?.localisation || offer?.adresse || offer?.ville);
    const description = normalizeSearchText(offer?.description || offer?.resume);

    return (
      title.includes(normalizedQuery) ||
      company.includes(normalizedQuery) ||
      location.includes(normalizedQuery) ||
      description.includes(normalizedQuery)
    );
  });
}
