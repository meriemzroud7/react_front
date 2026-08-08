import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUser, FiFileText, FiMail, FiSearch,
  FiBriefcase, FiVideo, FiMessageSquare, FiBookmark, FiBell,
  FiSettings, FiLogOut, FiMenu, FiX, FiChevronDown,
  FiMoon, FiSun
} from 'react-icons/fi';
import '../styles/recruteur-layout.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import CoachChatWidget from '../composant/CoachChatWidget';
import LanguageSwitcher from '../composant/LanguageSwitcher';
import { getAllOffres } from '../services/apiServiceOffres';
import { filterOffersByQuery } from '../utils/searchOffers';
import { getUnreadCount } from '../services/apiServiceNotification';

const API_ORIGIN = 'http://localhost:8080';

function getUserDisplayName(user, fallback = 'Utilisateur') {
  if (!user) return fallback;
  const first = user.prenom || user.firstName || user.first_name;
  const last = user.nom || user.lastName || user.last_name;
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (user.nomComplet) return user.nomComplet;
  if (user.name) return user.name;
  if (user.email) return user.email.split('@')[0];
  return fallback;
}

function getUserInitials(user, fallback = 'U') {
  const name = getUserDisplayName(user, fallback);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return fallback.slice(0, 2).toUpperCase() || 'U';
}

const ROLE_LABELS = { CANDIDAT: 'Candidat(e)', RECRUTEUR: 'Recruteur', ADMIN: 'Administrateur' };
function getUserRoleLabel(user, fallback = '') {
  if (!user) return fallback;
  const role = (user.role || '').toString().toUpperCase();
  return ROLE_LABELS[role] || fallback;
}

const NAV_ITEMS = [
  { to: '/candidat', icon: <FiGrid />, label: 'candidat.menu.dashboard', end: true },
  { to: '/candidat/profil', icon: <FiUser />, label: 'candidat.menu.profile' },
  { to: '/candidat/cv', icon: <FiFileText />, label: 'candidat.menu.cv' },
  { to: '/candidat/lettres', icon: <FiMail />, label: 'candidat.menu.generationCv' },
  { to: '/candidat/offres', icon: <FiSearch />, label: 'candidat.menu.jobSearch' },
  { to: '/candidat/candidatures', icon: <FiBriefcase />, label: 'candidat.menu.applications' },
  { to: '/candidat/entretiens', icon: <FiVideo />, label: 'candidat.menu.interviews' },
  { to: '/candidat/messagerie', icon: <FiMessageSquare />, label: 'candidat.menu.messaging' },
  { to: '/candidat/favoris', icon: <FiBookmark />, label: 'candidat.menu.favorites' },
  { to: '/candidat/notifications', icon: <FiBell />, label: 'candidat.menu.notifications' },
  { to: '/candidat/parametres', icon: <FiSettings />, label: 'candidat.menu.settings' },
  { to: '/candidat/generer-cv', icon: <FiFileText />, label: 'candidat.menu.generateCv' }
];

export default function CandidatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const searchBoxRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const displayName = getUserDisplayName(user, t('candidat.userDefault'));
  const initials = getUserInitials(user, t('candidat.userDefault'));
  const roleLabel = getUserRoleLabel(user, t('candidat.role'));
  const photoUrl = user?.image ? `${API_ORIGIN}/${user.image}` : null;

  useEffect(() => {
    async function loadOffers() {
      try {
        setLoadingOffers(true);
        const response = await getAllOffres();
        setOffers(response?.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des offres pour la recherche:', error);
      } finally {
        setLoadingOffers(false);
      }
    }

    loadOffers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingOffers = filterOffersByQuery(offers, searchQuery).slice(0, 5);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchOpen(false);
      return;
    }

    if (matchingOffers.length > 0) {
      navigate(`/candidat/offres/${matchingOffers[0].id}`);
    } else {
      navigate('/candidat/offres');
    }
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── Compteur de notifications non lues (badge sur la cloche) ──────────
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = () => {
      getUnreadCount(user.id)
        .then(({ data }) => setUnreadCount(data.count || 0))
        .catch((err) => console.error('Erreur lors du chargement des notifications non lues', err));
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // rafraîchit toutes les 30s
    return () => clearInterval(interval);
  }, [user?.id]);

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
            <div className="rl-sidebar__logo-sub">{t('candidat.logoSubtitle')}</div>
          </div>
          <button className="rl-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="rl-sidebar__nav">
          <p className="rl-sidebar__section-label">{t('candidat.group.main')}</p>
          {NAV_ITEMS.slice(0, 4).map(item => (
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

          <p className="rl-sidebar__section-label">{t('candidat.group.opportunities')}</p>
          {NAV_ITEMS.slice(4, 8).map(item => (
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

          <p className="rl-sidebar__section-label">{t('candidat.group.account')}</p>
          {NAV_ITEMS.slice(8).map(item => (
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

        <div className="rl-sidebar__footer">
          <div className="rl-sidebar__user">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="rl-sidebar__user-avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="rl-sidebar__user-avatar">{initials}</div>
            )}
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

          <form className="rl-topbar__search" ref={searchBoxRef} onSubmit={handleSearchSubmit}>
            <FiSearch className="rl-topbar__search-icon" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder={t('candidat.searchPlaceholder')}
            />

            {searchOpen && searchQuery.trim() && (
              <div className="rl-search-results">
                {loadingOffers && <div className="rl-search-results__item">Chargement des offres...</div>}

                {!loadingOffers && matchingOffers.length === 0 && (
                  <div className="rl-search-results__item">Aucune offre trouvée pour « {searchQuery} »</div>
                )}

                {!loadingOffers && matchingOffers.map((offer) => (
                  <button
                    key={offer.id}
                    type="button"
                    className="rl-search-results__item"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      navigate(`/candidat/offres/${offer.id}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <span className="rl-search-results__title">{offer.titre}</span>
                    <span className="rl-search-results__meta">{offer.nomEntreprise || offer.entreprise || 'Entreprise'}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="rl-topbar__right">
            <LanguageSwitcher />

            <button
              className="rl-topbar__theme"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('candidat.theme.light') : t('candidat.theme.dark')}
              title={theme === 'dark' ? t('candidat.theme.light') : t('candidat.theme.dark')}
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

            <NavLink to="/candidat/notifications" className="rl-topbar__notif">
              <FiBell />
              {unreadCount > 0 && (
                <span className="rl-topbar__notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </NavLink>

            <div className="rl-topbar__profile" onClick={() => setProfileOpen(!profileOpen)}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="rl-topbar__profile-avatar"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="rl-topbar__profile-avatar">{initials}</div>
              )}
              <span className="rl-topbar__profile-name">{displayName}</span>
              <FiChevronDown size={14} />
              {profileOpen && (
                <div className="rl-topbar__profile-menu">
                  <NavLink to="/candidat/parametres">{t('candidat.profile.settings')}</NavLink>
                  <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>{t('candidat.profile.logout')}</a>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="rl-content">
          <Outlet />
        </div>
      </div>

      <CoachChatWidget />
    </div>
  );
}