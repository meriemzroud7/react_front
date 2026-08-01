import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBriefcase, FiPlusCircle, FiUsers, FiCpu,
  FiBarChart2, FiCalendar, FiMessageSquare, FiSettings,
  FiLogOut, FiMenu, FiBell, FiSearch, FiChevronDown,
  FiVideo, FiLayers, FiMoon, FiSun
} from 'react-icons/fi';
import LanguageSwitcher from '../composant/LanguageSwitcher';
import '../styles/recruteur-layout.css';

const NAV_ITEMS = [
  { to: '/recruteur', icon: <FiGrid />, label: 'recruteur.menu.dashboard', end: true },
  { to: '/recruteur/offres', icon: <FiBriefcase />, label: 'recruteur.menu.offres' },
  { to: '/recruteur/offres/nouvelle', icon: <FiPlusCircle />, label: 'recruteur.menu.createOffer' },
  { to: '/recruteur/candidatures', icon: <FiUsers />, label: 'recruteur.menu.candidatures' },
  { to: '/recruteur/analyse-ia', icon: <FiCpu />, label: 'recruteur.menu.analyseIA' },
  { to: '/recruteur/comparaison', icon: <FiLayers />, label: 'recruteur.menu.comparaison' },
  { to: '/recruteur/entretiens', icon: <FiVideo />, label: 'recruteur.menu.entretiens' },
  { to: '/recruteur/calendrier', icon: <FiCalendar />, label: 'recruteur.menu.calendar' },
  { to: '/recruteur/messagerie', icon: <FiMessageSquare />, label: 'recruteur.menu.messaging' },
  { to: '/recruteur/rapports', icon: <FiBarChart2 />, label: 'recruteur.menu.reports' },
  { to: '/recruteur/parametres', icon: <FiSettings />, label: 'recruteur.menu.settings' },
];

export default function RecruteurLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const fullName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : t('recruteur.userDefault');
  const shortName = user ? `${user.prenom || ''} ${user.nom?.[0] ? user.nom[0] + '.' : ''}`.trim() : t('recruteur.userDefault');
  const initials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : '??';
  const role = user?.role === 'RECRUTEUR' ? t('recruteur.role') : (user?.role || '');

  const { theme, toggleTheme } = useTheme();

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
            <div className="rl-sidebar__logo-sub">{t('recruteur.logoSubtitle')}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="rl-sidebar__nav">
          <p className="rl-sidebar__section-label">{t('recruteur.group.main')}</p>
          {NAV_ITEMS.slice(0, 3).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `rl-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="rl-nav-item__icon">{item.icon}</span>
              <span>{t(item.label)}</span>
            </NavLink>
          ))}

          <p className="rl-sidebar__section-label">{t('recruteur.group.candidates')}</p>
          {NAV_ITEMS.slice(3, 7).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rl-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="rl-nav-item__icon">{item.icon}</span>
              <span>{t(item.label)}</span>
            </NavLink>
          ))}

          <p className="rl-sidebar__section-label">{t('recruteur.group.organization')}</p>
          {NAV_ITEMS.slice(7).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rl-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="rl-nav-item__icon">{item.icon}</span>
              <span>{t(item.label)}</span>
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
            <input placeholder={t('recruteur.searchPlaceholder')} />
          </div>

          <div className="rl-topbar__right">
            <LanguageSwitcher />

            <button className="rl-topbar__theme" onClick={toggleTheme} aria-label="Basculer le thème" title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

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
                  <NavLink to="/recruteur/parametres">{t('recruteur.profile.settings')}</NavLink>
                  <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>{t('recruteur.profile.logout')}</a>
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