import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiBriefcase, FiFileText, FiClipboard,
  FiCalendar, FiLayers, FiAward, FiCpu, FiFlag,
  FiBarChart2, FiBell, FiSettings, FiActivity, FiDatabase,
  FiLogOut, FiMenu, FiX, FiSearch, FiChevronDown
} from 'react-icons/fi';
import '../styles/admin-layout.css';

const NAV_ITEMS = [
  { to: '/admin', icon: <FiGrid />, label: 'Tableau de bord', end: true, group: 'Principal' },
  { to: '/admin/utilisateurs', icon: <FiUsers />, label: 'Utilisateurs', group: 'Principal' },
  { to: '/admin/entreprises', icon: <FiBriefcase />, label: 'Entreprises', group: 'Principal' },

  { to: '/admin/offres', icon: <FiFileText />, label: "Offres d'emploi", group: 'Recrutement' },
  { to: '/admin/candidatures', icon: <FiClipboard />, label: 'Candidatures', group: 'Recrutement' },
  { to: '/admin/entretiens', icon: <FiCalendar />, label: 'Entretiens', group: 'Recrutement' },

  { to: '/admin/referentiels', icon: <FiLayers />, label: 'Catégories & Référentiels', group: 'Configuration' },
  { to: '/admin/competences', icon: <FiAward />, label: 'Compétences', group: 'Configuration' },
  { to: '/admin/ia', icon: <FiCpu />, label: "Gestion de l'IA", group: 'Configuration' },

  { to: '/admin/signalements', icon: <FiFlag />, label: 'Signalements', group: 'Suivi' },
  { to: '/admin/rapports', icon: <FiBarChart2 />, label: 'Rapports & Stats', group: 'Suivi' },
  { to: '/admin/notifications', icon: <FiBell />, label: 'Notifications', group: 'Suivi' },

  { to: '/admin/parametres', icon: <FiSettings />, label: 'Paramètres', group: 'Système' },
  { to: '/admin/logs', icon: <FiActivity />, label: "Journal d'activité", group: 'Système' },
  { to: '/admin/maintenance', icon: <FiDatabase />, label: 'Sauvegarde & Maintenance', group: 'Système' },
];

const GROUPS = ['Principal', 'Recrutement', 'Configuration', 'Suivi', 'Système'];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="al-root">
      {sidebarOpen && <div className="al-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`al-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="al-sidebar__logo">
          <div className="al-sidebar__logo-icon">ف</div>
          <div>
            <div className="al-sidebar__logo-arabic">فرصة</div>
            <div className="al-sidebar__logo-sub">Espace Administrateur</div>
          </div>
          <button className="al-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="al-sidebar__nav">
          {GROUPS.map(group => (
            <React.Fragment key={group}>
              <p className="al-sidebar__section-label">{group}</p>
              {NAV_ITEMS.filter(i => i.group === group).map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="al-nav-item__icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="al-sidebar__footer">
          <div className="al-sidebar__user">
            <div className="al-sidebar__user-avatar">AD</div>
            <div className="al-sidebar__user-info">
              <div className="al-sidebar__user-name">Admin Fursa</div>
              <div className="al-sidebar__user-role">Administrateur</div>
            </div>
          </div>
          <button className="al-sidebar__logout" onClick={() => navigate('/')}>
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="al-main">
        <header className="al-topbar">
          <button className="al-topbar__burger" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>

          <div className="al-topbar__search">
            <FiSearch className="al-topbar__search-icon" />
            <input placeholder="Rechercher utilisateurs, offres, entreprises..." />
          </div>

          <div className="al-topbar__right">
            <button className="al-topbar__notif">
              <FiBell />
              <span className="al-topbar__notif-badge">6</span>
            </button>

            <div className="al-topbar__profile" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="al-topbar__profile-avatar">AD</div>
              <span className="al-topbar__profile-name">Admin</span>
              <FiChevronDown size={14} />
              {profileOpen && (
                <div className="al-topbar__profile-menu">
                  <NavLink to="/admin/parametres">Paramètres</NavLink>
                  <a href="/" onClick={() => navigate('/')}>Se déconnecter</a>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="al-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
