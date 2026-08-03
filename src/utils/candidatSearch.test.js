import { getSearchMatches } from './candidatSearch';

describe('getSearchMatches', () => {
  it('matches offers by title, company, or location', () => {
    const offers = [
      { id: 1, titre: 'Développeur React', nomEntreprise: 'TechLab', localisation: 'Sfax' },
      { id: 2, titre: 'Designer UX', nomEntreprise: 'Studio', localisation: 'Tunis' },
    ];

    expect(getSearchMatches(offers, 'react', ['titre', 'nomEntreprise', 'localisation'])).toEqual([offers[0]]);
    expect(getSearchMatches(offers, 'tunis', ['titre', 'nomEntreprise', 'localisation'])).toEqual([offers[1]]);
  });

  it('returns an empty list for an empty query', () => {
    const offers = [{ id: 1, titre: 'Développeur React' }];
    expect(getSearchMatches(offers, '', ['titre'])).toEqual([]);
  });
});
