import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUser, FiFileText, FiMail, FiSearch, FiZap,
  FiBriefcase, FiVideo, FiMessageSquare, FiBookmark, FiBell,
  FiSettings, FiLogOut, FiMenu, FiX, FiChevronDown
} from 'react-icons/fi';
import '../styles/recruteur-layout.css';
import { useAuth } from '../context/AuthContext';

// Petits utilitaires pour afficher dynamiquement les infos de l'utilisateur connecté
// (au lieu de valeurs codées en dur). Tolère plusieurs formats de champs possibles
// selon ce que renvoie le backend Spring Boot (ex: nom/prenom, firstName/lastName...).
function getUserDisplayName(user) {
  if (!user) return 'Utilisateur';
  const first = user.prenom || user.firstName || user.first_name;
  const last = user.nom || user.lastName || user.last_name;
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (user.nomComplet) return user.nomComplet;
  if (user.name) return user.name;
  if (user.email) return user.email.split('@')[0];
  return 'Utilisateur';
}

function getUserInitials(user) {
  const name = getUserDisplayName(user);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return 'U';
}

const ROLE_LABELS = { CANDIDAT: 'Candidat(e)', RECRUTEUR: 'Recruteur', ADMIN: 'Administrateur' };
function getUserRoleLabel(user, fallback = '') {
  if (!user) return fallback;
  const role = (user.role || '').toString().toUpperCase();
  return ROLE_LABELS[role] || fallback;
}

const NAV_ITEMS = [
  { to: '/candidat', icon: <FiGrid />, label: 'Tableau de bord', end: true },
  { to: '/candidat/profil', icon: <FiUser />, label: 'Mon profil' },
  { to: '/candidat/cv', icon: <FiFileText />, label: 'Mon CV' },
  { to: '/candidat/lettres', icon: <FiMail />, label: 'Lettres de motivation' },
  { to: '/candidat/offres', icon: <FiSearch />, label: 'Rechercher des offres' },
  { to: '/candidat/recommandations', icon: <FiZap />, label: 'Recommandations IA' },
  { to: '/candidat/candidatures', icon: <FiBriefcase />, label: 'Mes candidatures' },
  { to: '/candidat/entretiens', icon: <FiVideo />, label: 'Entretiens' },
  { to: '/candidat/messagerie', icon: <FiMessageSquare />, label: 'Messagerie' },
  { to: '/candidat/favoris', icon: <FiBookmark />, label: 'Offres sauvegardées' },
  { to: '/candidat/notifications', icon: <FiBell />, label: 'Notifications' },
  { to: '/candidat/parametres', icon: <FiSettings />, label: 'Paramètres' },
];

export default function CandidatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const roleLabel = getUserRoleLabel(user, 'Candidat(e)');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="rl-root">
      {sidebarOpen && (
        <div className="rl-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`rl-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="rl-sidebar__logo">
          <img src="/logof.png" alt="Fursa" className="rl-sidebar__logo-icon" />
          <div>
            <div className="rl-sidebar__logo-arabic">فرصة</div>
            <div className="rl-sidebar__logo-sub">Espace Candidat</div>
          </div>
          <button className="rl-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="rl-sidebar__nav">
          <p className="rl-sidebar__section-label">Principal</p>
          {NAV_ITEMS.slice(0, 4).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `rl-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="rl-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="rl-sidebar__section-label">Opportunités</p>
          {NAV_ITEMS.slice(4, 8).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rl-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="rl-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="rl-sidebar__section-label">Compte</p>
          {NAV_ITEMS.slice(8).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rl-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="rl-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rl-sidebar__footer">
          <div className="rl-sidebar__user">
            <div className="rl-sidebar__user-avatar">{initials}</div>
            <div className="rl-sidebar__user-info">
              <div className="rl-sidebar__user-name">{displayName}</div>
              <div className="rl-sidebar__user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="rl-sidebar__logout" onClick={handleLogout}>
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="rl-main">
        <header className="rl-topbar">
          <button className="rl-topbar__burger" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>

          <div className="rl-topbar__search">
            <FiSearch className="rl-topbar__search-icon" />
            <input placeholder="Rechercher une offre, une entreprise..." />
          </div>

          <div className="rl-topbar__right">
            <NavLink to="/candidat/notifications" className="rl-topbar__notif">
              <FiBell />
              <span className="rl-topbar__notif-badge">3</span>
            </NavLink>

            <div className="rl-topbar__profile" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="rl-topbar__profile-avatar">{initials}</div>
              <span className="rl-topbar__profile-name">{displayName}</span>
              <FiChevronDown size={14} />
              {profileOpen && (
                <div className="rl-topbar__profile-menu">
                  <NavLink to="/candidat/parametres">Paramètres</NavLink>
                  <a href="/" onClick={handleLogout}>Se déconnecter</a>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="rl-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}