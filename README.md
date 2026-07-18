# فرصة – Fursa | RH Recrutement IA Tunisie

Plateforme de recrutement IA pour la Tunisie. Landing page publique (accueil, connexion,
inscription, vérification OTP) fusionnée avec l'espace recruteur complet (tableau de bord,
offres, candidatures, analyse IA, entretiens, etc.).

## Démarrage rapide

```bash
npm install
npm start
```

L'application s'ouvre sur **http://localhost:3000**

---

## Pages disponibles

### Public
| Route | Page |
|-------|------|
| `/` | Landing page complète |
| `/login` | Connexion |
| `/register` | Inscription (Candidat / Recruteur) |
| `/verify` | Vérification OTP (code démo : `123456`) |

### Espace Recruteur (`/recruteur/...`)
| Route | Interface |
|-------|-----------|
| `/recruteur` | Tableau de bord |
| `/recruteur/offres` | Gestion des offres d'emploi |
| `/recruteur/offres/nouvelle` | Créer une offre |
| `/recruteur/candidatures` | Liste des candidatures |
| `/recruteur/analyse-ia` | Analyse IA des CV |
| `/recruteur/comparaison` | Comparaison des candidats |
| `/recruteur/profil/:id` | Profil d'un candidat |
| `/recruteur/entretiens` | Gestion des entretiens |
| `/recruteur/salle-entretien` | Salle d'entretien en ligne |
| `/recruteur/calendrier` | Calendrier RH |
| `/recruteur/messagerie` | Messagerie |
| `/recruteur/rapports` | Rapports & Statistiques |
| `/recruteur/parametres` | Paramètres du compte |

---

## Structure du projet

```
src/
├── composant/       Navbar, Footer, ChatbotWidget
├── context/         AuthContext
├── layouts/         MainLayout, AuthLayout, RecruteurLayout (sidebar)
├── locales/         fr.json
├── pages/
│   ├── Home.jsx, Login.jsx, Register.jsx, CodeVerification.jsx, NotFound.jsx
│   └── recruteur/   13 interfaces de l'espace recruteur
├── routes/          AppRoutes.jsx
└── styles/          CSS modulaire par section
```

## Technologies

- React 19 + React Router DOM v6
- React Icons (Fi, Ri)
- CSS Variables — zéro framework externe
- Create React App (react-scripts 5)

## Notes de fusion

Ce projet fusionne deux sources :
- Le tableau de bord recruteur (React + CSS pur, déjà fourni).
- La landing page publique (initialement React + TypeScript + Tailwind + shadcn/ui), qui a
  été **réécrite en JavaScript/CSS pur** afin de coller au style et à la stack déjà en place
  dans l'espace recruteur (mêmes variables de couleur `--primary`, `--accent`, etc., mêmes
  icônes `react-icons`, pas de dépendance Tailwind/Radix).

Le build a été vérifié avec `npm run build` — tout compile sans erreur.
