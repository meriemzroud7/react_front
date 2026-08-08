import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiGrid, FiUsers, FiFileText, FiClipboard,
  FiCalendar, FiBell, FiSettings, FiActivity,
  FiLogOut, FiMenu, FiX, FiSearch, FiChevronDown, FiMoon, FiSun,
  FiUser as FiCandidatIcon, FiClipboard as FiCandidatureIcon
} from 'react-icons/fi';
import '../styles/admin-layout.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from '../composant/LanguageSwitcher';
import { getUsers } from '../services/apiServiceUser';
import { getAllOffres } from '../services/apiServiceOffres';
import CandidatureService from '../services/apiServiceCandidature';
import { getUnreadCount } from '../services/apiServiceNotification';

const NAV_ITEMS = [
  { to: '/admin', icon: <FiGrid />, labelKey: 'dashboard', end: true, group: 'Principal' },
  { to: '/admin/utilisateurs', icon: <FiUsers />, labelKey: 'utilisateurs', group: 'Principal' },
  { to: '/admin/profil', icon: <FiCandidatIcon />, labelKey: 'profil', group: 'Principal' },

  { to: '/admin/offres', icon: <FiFileText />, labelKey: 'offres', group: 'Recrutement' },
  { to: '/admin/candidatures', icon: <FiClipboard />, labelKey: 'candidatures', group: 'Recrutement' },
  { to: '/admin/entretiens', icon: <FiCalendar />, labelKey: 'entretiens', group: 'Recrutement' },

  { to: '/admin/notifications', icon: <FiBell />, labelKey: 'notifications', group: 'Suivi' },

  { to: '/admin/parametres', icon: <FiSettings />, labelKey: 'parametres', group: 'Système' },
  { to: '/admin/logs', icon: <FiActivity />, labelKey: 'logs', group: 'Système' },
];

const GROUPS = ['Principal', 'Recrutement', 'Suivi', 'Système'];

function getUserField(user, ...keys) {
  for (const k of keys) {
    if (user && user[k] !== undefined && user[k] !== null && user[k] !== '') return user[k];
  }
  return '';
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const fullName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : t('admin.userDefault');
  const initials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || 'AD'
    : 'AD';
  const avatarUrl = user?.avatar || user?.avatarUrl || user?.photo || user?.image || user?.profilePicture || '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const platformLogo = (() => {
    try {
      return localStorage.getItem('platform_logo') || '/logof.png';
    } catch (e) {
      return '/logof.png';
    }
  })();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = () => {
      getUnreadCount(user.id)
        .then(({ data }) => setUnreadCount(data.count || 0))
        .catch((err) => console.error('Erreur lors du chargement des notifications non lues', err));
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [usersIndex, setUsersIndex] = useState([]);
  const [offresIndex, setOffresIndex] = useState([]);
  const [candidaturesIndex, setCandidaturesIndex] = useState([]);
  const [indexLoaded, setIndexLoaded] = useState(false);
  const searchBoxRef = useRef(null);

  const loadSearchIndex = useCallback(async () => {
    if (indexLoaded) return;
    setSearchLoading(true);
    try {
      const [usersRes, offresRes, candidatures] = await Promise.all([
        getUsers(),
        getAllOffres(),
        CandidatureService.getAll(),
      ]);
      setUsersIndex(usersRes.data || []);
      setOffresIndex(offresRes.data || []);
      setCandidaturesIndex(Array.isArray(candidatures) ? candidatures : []);
      setIndexLoaded(true);
    } catch (err) {
      console.error('Erreur lors du chargement de la recherche globale admin', err);
    } finally {
      setSearchLoading(false);
    }
  }, [indexLoaded]);

  const handleSearchFocus = () => {
    setSearchOpen(true);
    loadSearchIndex();
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();

  const matchedUsers = q
    ? usersIndex
        .filter((u) => {
          const name = `${getUserField(u, 'prenom')} ${getUserField(u, 'nom')}`.toLowerCase();
          const email = getUserField(u, 'email').toLowerCase();
          return name.includes(q) || email.includes(q);
        })
        .slice(0, 5)
    : [];

  const matchedOffres = q
    ? offresIndex.filter((o) => o.titre?.toLowerCase().includes(q)).slice(0, 5)
    : [];

  const matchedCandidatures = q
    ? candidaturesIndex
        .filter((c) => {
          const offre = offresIndex.find((o) => o.id === c.offreId);
          return offre?.titre?.toLowerCase().includes(q);
        })
        .slice(0, 5)
    : [];

  const hasResults = matchedUsers.length > 0 || matchedOffres.length > 0 || matchedCandidatures.length > 0;

  const goToList = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      e.target.blur();
    } else if (e.key === 'Enter') {
      if (matchedUsers.length > 0) goToList('/admin/utilisateurs');
      else if (matchedOffres.length > 0) goToList('/admin/offres');
      else if (matchedCandidatures.length > 0) goToList('/admin/candidatures');
    }
  };

  return (
    <div className="al-root">
      {sidebarOpen && <div className="al-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`al-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="al-sidebar__logo">
          <img src={platformLogo} alt="Fursa" className="al-sidebar__logo-icon" />
          <div>
            <div className="al-sidebar__logo-arabic">فرصة</div>
            <div className="al-sidebar__logo-sub">{t('admin.logoSubtitle')}</div>
          </div>
          <button className="al-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="al-sidebar__nav">
          {GROUPS.map(group => (
            <React.Fragment key={group}>
              <p className="al-sidebar__section-label">{t(`admin.groups.${group}`)}</p>
              {NAV_ITEMS.filter(i => i.group === group).map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="al-nav-item__icon">{item.icon}</span>
                  <span>{t(`admin.menu.${item.labelKey}`)}</span>
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="al-sidebar__footer">
          <div className="al-sidebar__user">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="al-sidebar__user-avatar-img" />
            ) : (
              <div className="al-sidebar__user-avatar">{initials}</div>
            )}
            <div className="al-sidebar__user-info">
              <div className="al-sidebar__user-name">{fullName}</div>
              <div className="al-sidebar__user-role">{t('admin.role')}</div>
            </div>
          </div>
          <button className="al-sidebar__logout" onClick={handleLogout}>
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="al-main">
        <header className="al-topbar">
          <button className="al-topbar__burger" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>

          <div className="al-topbar__search" ref={searchBoxRef} style={{ position: 'relative' }}>
            <FiSearch className="al-topbar__search-icon" />
            <input
              placeholder={t('admin.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
            />

            {searchOpen && q && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                  background: '#fff', border: '1px solid var(--border-light)', borderRadius: 12,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)', maxHeight: 380, overflowY: 'auto', zIndex: 50,
                }}
              >
                {searchLoading && (
                  <div style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {t('admin.search.loading')}
                  </div>
                )}

                {!searchLoading && !hasResults && (
                  <div style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {t('admin.search.noResults', { query: searchQuery })}
                  </div>
                )}

                {!searchLoading && matchedUsers.length > 0 && (
                  <div>
                    <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {t('admin.search.users')}
                    </div>
                    {matchedUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => goToList('/admin/utilisateurs')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <FiCandidatIcon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {`${getUserField(u, 'prenom')} ${getUserField(u, 'nom')}`.trim() || u.email}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!searchLoading && matchedOffres.length > 0 && (
                  <div>
                    <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {t('admin.search.offres')}
                    </div>
                    {matchedOffres.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => goToList('/admin/offres')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <FiFileText size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.titre}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!searchLoading && matchedCandidatures.length > 0 && (
                  <div>
                    <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {t('admin.search.candidatures')}
                    </div>
                    {matchedCandidatures.map((c) => {
                      const offre = offresIndex.find((o) => o.id === c.offreId);
                      return (
                        <div
                          key={c.id || c._id}
                          onClick={() => goToList('/admin/candidatures')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <FiCandidatureIcon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offre?.titre || '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="al-topbar__right">
            <LanguageSwitcher />

            <button
              className="al-topbar__theme"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-light)',
                background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--foreground)',
              }}
            >
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            <NavLink to="/admin/notifications" className="al-topbar__notif">
              <FiBell />
              {unreadCount > 0 && (
                <span className="al-topbar__notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </NavLink>

            <div className="al-topbar__profile" onClick={() => setProfileOpen(!profileOpen)}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="al-topbar__profile-avatar-img" />
              ) : (
                <div className="al-topbar__profile-avatar">{initials}</div>
              )}
              <span className="al-topbar__profile-name">{fullName}</span>
              <FiChevronDown size={14} />
              {profileOpen && (
                <div className="al-topbar__profile-menu">
                  <NavLink to="/admin/parametres">{t('admin.profile.settings')}</NavLink>
                  <a href="/" onClick={handleLogout}>{t('admin.profile.logout')}</a>
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