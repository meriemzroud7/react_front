export const candidate = {
  firstName: 'Meriem',
  lastName: 'Ben Salem',
  avatar: 'MB',
  title: 'Étudiante ingénieure — Génie Informatique',
  school: 'ESPRIT',
  level: 'Cycle ingénieur — 1ère année',
  city: 'Monastir, Tunisie',
  phone: '+216 20 123 456',
  email: 'meriem.bensalem@esprit.tn',
  contractType: 'Stage',
  salaryExpectation: '600 - 900 DT / mois',
  mobility: 'Monastir, Sousse, Tunis (télétravail possible)',
  linkedin: 'linkedin.com/in/meriem-bensalem',
  github: 'github.com/meriem-bs',
  portfolio: 'meriem-bs.dev',
  profileCompletion: 82,
};

export const dashboardStats = [
  { label: 'Candidatures envoyées', value: '14', delta: '+4', up: true, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
  { label: 'En cours d\'analyse', value: '5', delta: '+2', up: true, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
  { label: 'Entretiens programmés', value: '2', delta: '+1', up: true, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { label: 'Offres sauvegardées', value: '9', delta: '+3', up: true, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  { label: 'Notifications', value: '3', delta: '-2', up: false, color: '#be185d', bg: 'rgba(190,24,93,0.1)' },
];

export const activityHistory = [
  { label: 'Candidature envoyée à TAV.IS — Développeur Full Stack', time: 'Il y a 2 h' },
  { label: 'Entretien confirmé avec Vermeg — Stage PFE', time: 'Il y a 1 jour' },
  { label: 'Nouveau message de la recruteuse Nadia K.', time: 'Il y a 1 jour' },
  { label: 'CV mis à jour et réanalysé par l\'IA', time: 'Il y a 3 jours' },
  { label: 'Offre sauvegardée : Instadeep — Stage IA/ML', time: 'Il y a 4 jours' },
];

export const upcomingInterviews = [
  { id: 1, company: 'Vermeg', role: 'Stage PFE — Ingénierie Logicielle', date: '24 juil. 2026', time: '10:00', type: 'En ligne', avatar: 'VM', color: '#7c3aed' },
  { id: 2, company: 'TAV.IS', role: 'Développeur Full Stack Junior', date: '28 juil. 2026', time: '14:30', type: 'Présentiel', avatar: 'TV', color: '#1e4fa3' },
];

export const jobs = [
  {
    id: 1,
    company: 'Instadeep',
    logo: 'IN',
    color: '#7c3aed',
    role: 'Stage — Ingénieur IA / Matching CV',
    city: 'Tunis (Télétravail partiel)',
    contract: 'Stage',
    salary: '800 DT/mois',
    published: 'Publiée il y a 2 jours',
    match: 92,
    domain: 'Intelligence Artificielle',
    level: 'Bac+3 à Bac+5',
    description: 'Rejoignez l\'équipe R&D pour concevoir des modèles de matching CV/offres basés sur des embeddings sémantiques et affiner un pipeline de scoring de compatibilité.',
    missions: ['Développer un module de scoring CV ↔ offre', 'Participer à l\'entraînement et l\'évaluation de modèles NLP', 'Documenter les expérimentations'],
    skillsRequired: ['Python', 'NLP', 'React', 'MongoDB'],
    matchingSkills: ['Python', 'MongoDB'],
    missingSkills: ['NLP avancé'],
    profile: 'Étudiant(e) en cycle ingénieur, à l\'aise avec le machine learning et le développement web.',
    benefits: ['Mentorat technique', 'Prime de transport', 'Café illimité'],
    deadline: '10 août 2026',
    aboutCompany: 'Instadeep est une entreprise tech spécialisée en intelligence artificielle appliquée, avec un hub d\'ingénierie basé en Tunisie.',
    selectionProbability: 78,
  },
  {
    id: 2,
    company: 'TAV.IS',
    logo: 'TV',
    color: '#1e4fa3',
    role: 'Développeur Full Stack Junior',
    city: 'Monastir',
    contract: 'Stage',
    salary: '700 DT/mois',
    published: 'Publiée il y a 5 jours',
    match: 88,
    domain: 'Développement Web',
    level: 'Bac+3',
    description: 'Participer à la conception d\'une plateforme de gestion RH avec React.js et Spring Boot, incluant l\'authentification sécurisée et un module de recommandation.',
    missions: ['Développer des interfaces React.js', 'Concevoir des API REST avec Spring Boot', 'Modéliser les données sous MongoDB'],
    skillsRequired: ['React.js', 'Spring Boot', 'MongoDB', 'Git'],
    matchingSkills: ['React.js', 'Spring Boot', 'MongoDB', 'Git'],
    missingSkills: [],
    profile: 'Étudiant(e) en informatique, stack MERN/Spring apprécié.',
    benefits: ['Encadrement senior', 'Possibilité d\'embauche'],
    deadline: '5 août 2026',
    aboutCompany: 'TAV.IS est une société IT basée à Monastir, partenaire de plusieurs écoles d\'ingénieurs de la région.',
    selectionProbability: 85,
  },
  {
    id: 3,
    company: 'Vermeg',
    logo: 'VM',
    color: '#0f766e',
    role: 'Stage PFE — Ingénierie Logicielle',
    city: 'Tunis',
    contract: 'Stage',
    salary: '900 DT/mois',
    published: 'Publiée il y a 1 semaine',
    match: 81,
    domain: 'Développement Logiciel',
    level: 'Bac+5',
    description: 'Contribuer au développement d\'un module bancaire critique au sein d\'une équipe agile internationale.',
    missions: ['Développement Java/Spring', 'Tests unitaires et d\'intégration', 'Participation aux cérémonies agiles'],
    skillsRequired: ['Java', 'Spring Boot', 'SQL', 'Scrum'],
    matchingSkills: ['Spring Boot', 'SQL'],
    missingSkills: ['Java avancé', 'Scrum'],
    profile: 'Étudiant(e) en dernière année, rigueur et autonomie exigées.',
    benefits: ['Restaurant d\'entreprise', 'Formation interne'],
    deadline: '15 août 2026',
    aboutCompany: 'Vermeg est un éditeur de logiciels financiers présent à l\'international.',
    selectionProbability: 64,
  },
  {
    id: 4,
    company: 'Expensya',
    logo: 'EX',
    color: '#d97706',
    role: 'Stage — Développeur Frontend React',
    city: 'Sousse',
    contract: 'Stage',
    salary: '650 DT/mois',
    published: 'Publiée aujourd\'hui',
    match: 76,
    domain: 'Développement Web',
    level: 'Bac+2 à Bac+3',
    description: 'Amélioration continue de l\'interface utilisateur d\'une plateforme SaaS de gestion des notes de frais.',
    missions: ['Intégration de maquettes Figma', 'Optimisation des performances React', 'Tests unitaires'],
    skillsRequired: ['React.js', 'TypeScript', 'Tailwind CSS'],
    matchingSkills: ['React.js'],
    missingSkills: ['TypeScript'],
    profile: 'Sensibilité UI/UX, goût du détail.',
    benefits: ['Télétravail flexible', 'Tickets restaurant'],
    deadline: '1 août 2026',
    aboutCompany: 'Expensya est une scale-up tunisienne spécialisée en gestion des dépenses professionnelles.',
    selectionProbability: 70,
  },
];

export const applications = [
  { id: 1, jobId: 2, company: 'TAV.IS', role: 'Développeur Full Stack Junior', date: '18 juil. 2026', status: 'Entretien', statusClass: 'blue', aiScore: 88, updated: 'Il y a 1 jour', color: '#1e4fa3', avatar: 'TV' },
  { id: 2, jobId: 3, company: 'Vermeg', role: 'Stage PFE — Ingénierie Logicielle', date: '15 juil. 2026', status: 'Présélectionné', statusClass: 'amber', aiScore: 81, updated: 'Il y a 2 jours', color: '#0f766e', avatar: 'VM' },
  { id: 3, jobId: 1, company: 'Instadeep', role: 'Stage — Ingénieur IA / Matching CV', date: '12 juil. 2026', status: 'En cours', statusClass: 'gray', aiScore: 92, updated: 'Il y a 3 jours', color: '#7c3aed', avatar: 'IN' },
  { id: 4, jobId: 4, company: 'Expensya', role: 'Stage — Développeur Frontend React', date: '8 juil. 2026', status: 'Envoyée', statusClass: 'gray', aiScore: 76, updated: 'Il y a 5 jours', color: '#d97706', avatar: 'EX' },
  { id: 5, jobId: 4, company: 'Focus Corporate', role: 'Stage — Assistant Chef de Projet IT', date: '1 juil. 2026', status: 'Refusée', statusClass: 'red', aiScore: 58, updated: 'Il y a 2 semaines', color: '#be185d', avatar: 'FC' },
];

export const applicationTimeline = [
  { step: 'Candidature envoyée', date: '18 juil. 2026', done: true },
  { step: 'Analyse IA du profil', date: '18 juil. 2026', done: true },
  { step: 'Présélection', date: '19 juil. 2026', done: true },
  { step: 'Entretien planifié', date: '24 juil. 2026', done: true },
  { step: 'Décision finale', date: 'En attente', done: false },
];

export const conversations = [
  { id: 1, name: 'Nadia K. — TAV.IS', lastMessage: 'Merci de confirmer votre disponibilité pour jeudi 10h.', time: '10:42', unread: true, avatar: 'NK', color: '#1e4fa3' },
  { id: 2, name: 'Recrutement Vermeg', lastMessage: 'Votre candidature a été présélectionnée, félicitations !', time: 'Hier', unread: false, avatar: 'RV', color: '#0f766e' },
  { id: 3, name: 'Support Espace Candidat', lastMessage: 'N\'hésitez pas si vous avez des questions sur la plateforme.', time: 'Lun.', unread: false, avatar: 'SC', color: '#d97706' },
];

export const messages = [
  { id: 1, from: 'them', text: 'Bonjour Meriem, merci pour votre candidature au poste de Développeur Full Stack.', time: '09:10' },
  { id: 2, from: 'me', text: 'Bonjour, merci à vous ! Je suis très intéressée par le poste.', time: '09:20' },
  { id: 3, from: 'them', text: 'Seriez-vous disponible pour un entretien en ligne jeudi à 10h ?', time: '10:30' },
  { id: 4, from: 'them', text: 'Merci de confirmer votre disponibilité pour jeudi 10h.', time: '10:42' },
];

export const notifications = [
  { id: 1, type: 'offer', text: 'Nouvelle offre correspondant à votre profil : Instadeep — Stage IA.', time: 'Il y a 1 h', read: false },
  { id: 2, type: 'interview', text: 'Rappel : entretien avec Vermeg demain à 10:00.', time: 'Il y a 3 h', read: false },
  { id: 3, type: 'message', text: 'Nouveau message de Nadia K. (TAV.IS).', time: 'Il y a 5 h', read: false },
  { id: 4, type: 'status', text: 'Votre candidature chez Vermeg est passée au statut « Présélectionnée ».', time: 'Il y a 1 jour', read: true },
  { id: 5, type: 'application', text: 'Votre candidature chez Expensya a bien été envoyée.', time: 'Il y a 5 jours', read: true },
];

export const savedJobIds = [1, 3];

export const coverLetters = [
  { id: 1, title: 'Lettre — Stage Développeur Full Stack (TAV.IS)', updated: '18 juil. 2026' },
  { id: 2, title: 'Lettre générique — Ingénierie Logicielle', updated: '10 juil. 2026' },
];

export const cvData = {
  fileName: 'CV_Meriem_BenSalem_2026.pdf',
  uploadedAt: '18 juil. 2026',
  qualityScore: 84,
  isDefault: true,
  extracted: {
    skills: ['React.js', 'Spring Boot', 'MongoDB', 'Java', 'Git', 'Python'],
    experience: ['Stage — Plateforme e-learning LearnWay (Symfony/JavaFX)', 'Projet académique — Application de gestion RH'],
    education: ['Cycle ingénieur Génie Informatique — ESPRIT (en cours)'],
  },
  suggestions: [
    'Ajouter des indicateurs chiffrés à vos réalisations de projet.',
    'Préciser le niveau de maîtrise de chaque compétence technique.',
    'Ajouter un lien vers votre portfolio en en-tête.',
  ],
};
