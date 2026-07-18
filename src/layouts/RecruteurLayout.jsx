import React, { useState } from 'react';
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
          <div className="rl-sidebar__logo-icon">ف</div>
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
            <div className="rl-sidebar__user-avatar">MK</div>
            <div className="rl-sidebar__user-info">
              <div className="rl-sidebar__user-name">Mariem Khelil</div>
              <div className="rl-sidebar__user-role">Responsable RH</div>
            </div>
          </div>
          <button className="rl-sidebar__logout" onClick={() => navigate('/')}>
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
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
              <div className="rl-topbar__profile-avatar">MK</div>
              <span className="rl-topbar__profile-name">Mariem K.</span>
              <FiChevronDown size={14} />
              {profileOpen && (
                <div className="rl-topbar__profile-menu">
                  <NavLink to="/recruteur/parametres">Paramètres</NavLink>
                  <a href="/" onClick={() => navigate('/')}>Se déconnecter</a>
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
