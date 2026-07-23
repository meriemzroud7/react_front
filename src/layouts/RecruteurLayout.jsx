import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBriefcase, FiPlusCircle, FiUsers, FiCpu,
  FiBarChart2, FiCalendar, FiMessageSquare, FiSettings,
  FiLogOut, FiMenu, FiX, FiBell, FiSearch, FiChevronDown,
  FiVideo, FiLayers
} from 'react-icons/fi';
import '../styles/recruteur-layout.css';

const NAV_ITEMS = [
  { to: '/recruteur', icon: <FiGrid />, label: 'Tableau de bord', end: true },
  { to: '/recruteur/offres', icon: <FiBriefcase />, label: 'Offres d\'emploi' },
  { to: '/recruteur/offres/nouvelle', icon: <FiPlusCircle />, label: 'Créer une offre' },
  { to: '/recruteur/candidatures', icon: <FiUsers />, label: 'Candidatures' },
  { to: '/recruteur/analyse-ia', icon: <FiCpu />, label: 'Analyse IA' },
  { to: '/recruteur/comparaison', icon: <FiLayers />, label: 'Comparaison' },
  { to: '/recruteur/entretiens', icon: <FiVideo />, label: 'Entretiens' },
  { to: '/recruteur/calendrier', icon: <FiCalendar />, label: 'Calendrier RH' },
  { to: '/recruteur/messagerie', icon: <FiMessageSquare />, label: 'Messagerie' },
  { to: '/recruteur/rapports', icon: <FiBarChart2 />, label: 'Rapports & Stats' },
  { to: '/recruteur/parametres', icon: <FiSettings />, label: 'Paramètres' },
];

export default function RecruteurLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fullName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : 'Utilisateur';
  const shortName = user ? `${user.prenom || ''} ${user.nom?.[0] ? user.nom[0] + '.' : ''}`.trim() : 'Utilisateur';
  const initials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : '??';
  const role = user?.role === 'RECRUTEUR' ? 'Responsable RH' : (user?.role || '');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="rl-root">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="rl-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`rl-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="rl-sidebar__logo">
          <div className="rl-sidebar__logo-icon">
            <img src="/logof.png" alt="Fursa" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div className="rl-sidebar__logo-arabic">فرصة</div>
            <div className="rl-sidebar__logo-sub">Espace Recruteur</div>
          </div>
          <button className="rl-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        {/* Nav */}
        <nav className="rl-sidebar__nav">
          <p className="rl-sidebar__section-label">Principal</p>
          {NAV_ITEMS.slice(0, 3).map(item => (
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

          <p className="rl-sidebar__section-label">Candidats</p>
          {NAV_ITEMS.slice(3, 7).map(item => (
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

          <p className="rl-sidebar__section-label">Organisation</p>
          {NAV_ITEMS.slice(7).map(item => (
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

        {/* Sidebar footer */}
        <div className="rl-sidebar__footer">
          <div className="rl-sidebar__user">
            <div className="rl-sidebar__user-avatar">{initials}</div>
            <div className="rl-sidebar__user-info">
              <div className="rl-sidebar__user-name">{fullName}</div>
              <div className="rl-sidebar__user-role">{role}</div>
            </div>
          </div>
          <button className="rl-sidebar__logout" onClick={handleLogout}>
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content — IMPORTANT : ce wrapper doit envelopper le topbar + le contenu */}
      <div className="rl-main">
        {/* Topbar */}
        <header className="rl-topbar">
          <button className="rl-topbar__burger" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>

          <div className="rl-topbar__search">
            <FiSearch className="rl-topbar__search-icon" />
            <input placeholder="Rechercher candidats, offres..." />
          </div>

          <div className="rl-topbar__right">
            <button className="rl-topbar__notif">
              <FiBell />
              <span className="rl-topbar__notif-badge">4</span>
            </button>

            <div className="rl-topbar__profile" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="rl-topbar__profile-avatar">{initials}</div>
              <span className="rl-topbar__profile-name">{shortName}</span>
              <FiChevronDown size={14} />
              {profileOpen && (
                <div className="rl-topbar__profile-menu">
                  <NavLink to="/recruteur/parametres">Paramètres</NavLink>
                  <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Se déconnecter</a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="rl-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}