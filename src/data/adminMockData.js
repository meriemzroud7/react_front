// Mock data — Espace Administrateur (à remplacer par les appels API Spring Boot)

export const USERS = [
  { id: 1, name: 'Yasmine Ben Ali', email: 'yasmine.benali@mail.com', role: 'Candidat', date: '12/01/2026', status: 'Actif', avatar: 'YB', color: '#1e4fa3' },
  { id: 2, name: 'Mariem Khelil', email: 'mariem.khelil@fursa.tn', role: 'Recruteur', date: '03/11/2025', status: 'Actif', avatar: 'MK', color: '#0f766e' },
  { id: 3, name: 'Ahmed Maalej', email: 'ahmed.maalej@mail.com', role: 'Candidat', date: '22/12/2025', status: 'En attente', avatar: 'AM', color: '#7c3aed' },
  { id: 4, name: 'Sarra Chaari', email: 'sarra.chaari@techcorp.tn', role: 'Recruteur', date: '15/09/2025', status: 'Actif', avatar: 'SC', color: '#be185d' },
  { id: 5, name: 'Mohamed Tlili', email: 'mohamed.tlili@mail.com', role: 'Candidat', date: '02/02/2026', status: 'Suspendu', avatar: 'MT', color: '#d97706' },
  { id: 6, name: 'Fathi Hamdi', email: 'fathi.hamdi@admin.fursa.tn', role: 'Administrateur', date: '10/06/2025', status: 'Actif', avatar: 'FH', color: '#16a34a' },
];

export const ENTREPRISES = [
  { id: 1, name: 'TechCorp Tunisie', sector: 'Informatique', address: 'Monastir, TN', hr: 'Sarra Chaari', email: 'contact@techcorp.tn', offers: 8, status: 'Vérifiée', color: '#1e4fa3' },
  { id: 2, name: 'Sartex Group', sector: 'Textile', address: 'Ksar Hellal, TN', hr: 'Nizar Jendoubi', email: 'rh@sartex.tn', offers: 3, status: 'Vérifiée', color: '#0f766e' },
  { id: 3, name: 'InnovLab', sector: 'IA / Data', address: 'Tunis, TN', hr: 'Rania Sassi', email: 'jobs@innovlab.tn', offers: 5, status: 'En attente', color: '#7c3aed' },
  { id: 4, name: 'MedTech Solutions', sector: 'Santé numérique', address: 'Sousse, TN', hr: 'Karim Ferjani', email: 'hr@medtech.tn', offers: 2, status: 'Suspendue', color: '#d97706' },
];

export const OFFRES = [
  { id: 1, title: 'Développeur Full Stack React/Spring', company: 'TechCorp Tunisie', recruiter: 'Sarra Chaari', type: 'CDI', date: '05/01/2026', apps: 34, status: 'Publiée' },
  { id: 2, title: 'Data Analyst Junior', company: 'InnovLab', recruiter: 'Rania Sassi', type: 'Stage', date: '18/01/2026', apps: 21, status: 'Publiée' },
  { id: 3, title: 'Ingénieur DevOps', company: 'TechCorp Tunisie', recruiter: 'Sarra Chaari', type: 'CDI', date: '20/12/2025', apps: 12, status: 'Fermée' },
  { id: 4, title: 'Responsable RH', company: 'Sartex Group', recruiter: 'Nizar Jendoubi', type: 'CDI', date: '22/01/2026', apps: 7, status: 'En attente' },
];

export const CANDIDATURES = [
  { id: 1, candidate: 'Yasmine Ben Ali', offer: 'Développeur Full Stack', company: 'TechCorp Tunisie', date: '10/01/2026', status: 'Entretien', score: 94 },
  { id: 2, candidate: 'Ahmed Maalej', offer: 'Data Analyst Junior', company: 'InnovLab', date: '15/01/2026', status: 'En attente', score: 87 },
  { id: 3, candidate: 'Mohamed Tlili', offer: 'Ingénieur DevOps', company: 'TechCorp Tunisie', date: '02/01/2026', status: 'Refusée', score: 61 },
  { id: 4, candidate: 'Yasmine Ben Ali', offer: 'Responsable RH', company: 'Sartex Group', date: '23/01/2026', status: 'Retenue', score: 91 },
];

export const ENTRETIENS = [
  { id: 1, candidate: 'Yasmine Ben Ali', recruiter: 'Sarra Chaari', offer: 'Développeur Full Stack', date: '28/01/2026', time: '14:00', type: 'En ligne', status: 'Programmé' },
  { id: 2, candidate: 'Ahmed Maalej', recruiter: 'Rania Sassi', offer: 'Data Analyst Junior', date: '29/01/2026', time: '10:30', type: 'Présentiel', status: 'Programmé' },
  { id: 3, candidate: 'Mohamed Tlili', recruiter: 'Sarra Chaari', offer: 'Ingénieur DevOps', date: '18/01/2026', time: '09:00', type: 'En ligne', status: 'Terminé' },
];

export const SKILLS = [
  { id: 1, name: 'Java', category: 'Backend', usage: 128 },
  { id: 2, name: 'React', category: 'Frontend', usage: 142 },
  { id: 3, name: 'Spring Boot', category: 'Backend', usage: 96 },
  { id: 4, name: 'Python', category: 'Data / IA', usage: 110 },
  { id: 5, name: 'Docker', category: 'DevOps', usage: 74 },
  { id: 6, name: 'Communication', category: 'Soft skill', usage: 201 },
  { id: 7, name: 'Leadership', category: 'Soft skill', usage: 88 },
];

export const REFERENTIELS = {
  secteurs: ['Informatique', 'Textile', 'Santé numérique', 'IA / Data', 'Finance', 'Éducation'],
  contrats: ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'],
  niveauxEtudes: ["Bac", "Bac+2", "Licence", "Ingénieur / Master", 'Doctorat'],
  niveauxExperience: ['Débutant', '1-3 ans', '3-5 ans', '5-10 ans', '10 ans +'],
  langues: ['Français', 'Anglais', 'Arabe', 'Allemand', 'Espagnol'],
};

export const SIGNALEMENTS = [
  { id: 1, type: 'Offre', subject: 'Offre suspecte "Data Entry - paiement immédiat"', priority: 'Haute', date: '20/01/2026', status: 'Ouvert' },
  { id: 2, type: 'Candidat', subject: 'Réclamation sur un refus non justifié', priority: 'Moyenne', date: '18/01/2026', status: 'En cours' },
  { id: 3, type: 'Recruteur', subject: 'Retard répété sur les réponses aux candidats', priority: 'Basse', date: '12/01/2026', status: 'Clôturé' },
];

export const LOGS = [
  { id: 1, user: 'Sarra Chaari', action: 'Publication offre', date: '25/07/2026 14:32', severity: 'Info' },
  { id: 2, user: 'Ahmed Maalej', action: 'Candidature soumise', date: '25/07/2026 12:10', severity: 'Info' },
  { id: 3, user: 'system', action: "Échec envoi email vérification", date: '25/07/2026 09:47', severity: 'Erreur' },
  { id: 4, user: 'Admin Fursa', action: 'Suspension utilisateur #5', date: '24/07/2026 18:02', severity: 'Avertissement' },
];

export const NOTIFICATIONS_HISTORY = [
  { id: 1, title: 'Maintenance planifiée le 30/07', target: 'Tous', date: '24/07/2026', status: 'Envoyée' },
  { id: 2, title: 'Nouvelle fonctionnalité : matching IA v2', target: 'Recruteurs', date: '20/07/2026', status: 'Envoyée' },
  { id: 3, title: "Rappel : vérifiez votre profil", target: 'Candidats', date: '28/07/2026', status: 'Planifiée' },
];

export const STAT_COLORS = {
  green: 'var(--success)', red: 'var(--danger)', blue: 'var(--primary)', amber: 'var(--accent-dark)', gray: 'var(--muted)'
};

export function statusToBadge(status) {
  const map = {
    'Actif': 'green', 'Vérifiée': 'green', 'Publiée': 'green', 'Retenue': 'green', 'Programmé': 'blue', 'Envoyée': 'green', 'Terminé': 'gray', 'Clôturé': 'gray',
    'En attente': 'amber', 'Planifiée': 'amber', 'En cours': 'amber',
    'Suspendu': 'red', 'Suspendue': 'red', 'Fermée': 'red', 'Refusée': 'red', 'Ouvert': 'red',
    'Entretien': 'blue',
  };
  return map[status] || 'gray';
}
