import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBriefcase, FiPlusCircle, FiUsers, FiCpu,
  FiBarChart2, FiCalendar, FiMessageSquare, FiSettings,
  FiLogOut, FiMenu, FiBell, FiSearch, FiChevronDown,
  FiVideo, FiLayers, FiMoon, FiSun, FiBriefcase as FiOffreIcon, FiUser as FiCandidatIcon
} from 'react-icons/fi';
import LanguageSwitcher from '../composant/LanguageSwitcher';
import { getOffresByRecruteur } from '../services/apiServiceOffres';
import CandidatureService from '../services/apiServiceCandidature';
import { getUnreadCount } from '../services/apiServiceNotification';
import '../styles/recruteur-layout.css';

const API_ORIGIN = 'http://localhost:8080';

function getUserField(user, ...keys) {
  for (const k of keys) {
    if (user && user[k] !== undefined && user[k] !== null && user[k] !== '') return user[k];
  }
  return '';
}

function candidatDisplayName(user) {
  const prenom = getUserField(user, 'prenom', 'firstName', 'firstname');
  const nom = getUserField(user, 'nom', 'lastName', 'lastname');
  const full = `${prenom} ${nom}`.trim();
  return full || getUserField(user, 'email') || 'Candidat';
}

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
  { to: '/recruteur/notifications', icon: <FiBell />, label: 'recruteur.menu.notifications' },
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
  const photoUrl = user?.image ? `${API_ORIGIN}/${user.image}` : null;

  const { theme, toggleTheme } = useTheme();

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

  // ── Recherche globale (offres + candidatures) ───────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [offresIndex, setOffresIndex] = useState([]); // toutes les offres du recruteur, chargées une fois
  const [candidaturesIndex, setCandidaturesIndex] = useState([]); // candidatures enrichies, chargées une fois
  const [indexLoaded, setIndexLoaded] = useState(false);
  const searchBoxRef = useRef(null);

  // Charge une seule fois (à la première interaction) les offres + candidatures du recruteur,
  // pour permettre une recherche instantanée côté client sans appel réseau à chaque frappe.
  const loadSearchIndex = useCallback(async () => {
    if (indexLoaded || !user?.id) return;
    setSearchLoading(true);
    try {
      const [offresRes, candidatures] = await Promise.all([
        getOffresByRecruteur(user.id),
        CandidatureService.getByRecruteur(user.id),
      ]);
      const offresList = offresRes.data || [];
      setOffresIndex(offresList);

      const users = await CandidatureService.getUsersByIds(candidatures.map((c) => c.candidatId));
      const offresById = Object.fromEntries(offresList.map((o) => [o.id || o._id, o]));
      setCandidaturesIndex(
        candidatures.map((c) => ({
          ...c,
          candidatNom: candidatDisplayName(users[c.candidatId]),
          candidatEmail: getUserField(users[c.candidatId], 'email'),
          offreTitre: offresById[c.offreId]?.titre || '',
        }))
      );
      setIndexLoaded(true);
    } catch (err) {
      console.error('Erreur lors du chargement de la recherche globale', err);
    } finally {
      setSearchLoading(false);
    }
  }, [indexLoaded, user?.id]);

  const handleSearchFocus = () => {
    setSearchOpen(true);
    loadSearchIndex();
  };

  // Ferme le dropdown si on clique en dehors de la barre de recherche
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
  const matchedOffres = q
    ? offresIndex.filter((o) => o.titre?.toLowerCase().includes(q)).slice(0, 5)
    : [];
  const matchedCandidatures = q
    ? candidaturesIndex
        .filter(
          (c) =>
            c.candidatNom?.toLowerCase().includes(q) ||
            c.candidatEmail?.toLowerCase().includes(q) ||
            c.offreTitre?.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];
  const hasResults = matchedOffres.length > 0 || matchedCandidatures.length > 0;

  const goToOffre = (offre) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/recruteur/offres/${offre.id || offre._id}/modifier`);
  };

  const goToCandidature = (c) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/recruteur/profil/${c.candidatId}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      e.target.blur();
    } else if (e.key === 'Enter') {
      // Enter avec un seul résultat pertinent -> y aller directement
      if (matchedOffres.length === 1 && matchedCandidatures.length === 0) {
        goToOffre(matchedOffres[0]);
      } else if (matchedCandidatures.length === 1 && matchedOffres.length === 0) {
        goToCandidature(matchedCandidatures[0]);
      } else if (matchedOffres.length > 0) {
        navigate('/recruteur/offres');
        setSearchOpen(false);
      } else if (matchedCandidatures.length > 0) {
        navigate('/recruteur/candidatures');
        setSearchOpen(false);
      }
    }
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
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="rl-sidebar__user-avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="rl-sidebar__user-avatar">{initials}</div>
            )}
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

          <div className="rl-topbar__search" ref={searchBoxRef} style={{ position: 'relative' }}>
            <FiSearch className="rl-topbar__search-icon" />
            <input
              placeholder={t('recruteur.searchPlaceholder')}
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
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)', maxHeight: 360, overflowY: 'auto', zIndex: 50,
                }}
              >
                {searchLoading && (
                  <div style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    Recherche en cours...
                  </div>
                )}

                {!searchLoading && !hasResults && (
                  <div style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    Aucun résultat pour « {searchQuery} »
                  </div>
                )}

                {!searchLoading && matchedOffres.length > 0 && (
                  <div>
                    <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Offres
                    </div>
                    {matchedOffres.map((o) => (
                      <div
                        key={o.id || o._id}
                        onClick={() => goToOffre(o)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <FiOffreIcon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.titre}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!searchLoading && matchedCandidatures.length > 0 && (
                  <div>
                    <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Candidats
                    </div>
                    {matchedCandidatures.map((c) => (
                      <div
                        key={c.id || c._id}
                        onClick={() => goToCandidature(c)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <FiCandidatIcon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.candidatNom}</div>
                          {c.offreTitre && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{c.offreTitre}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rl-topbar__right">
            <LanguageSwitcher />

            <button className="rl-topbar__theme" onClick={toggleTheme} aria-label="Basculer le thème" title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

            <NavLink to="/recruteur/notifications" className="rl-topbar__notif">
              <FiBell />
              {unreadCount > 0 && (
                <span className="rl-topbar__notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </NavLink>

            <div className="rl-topbar__profile" onClick={() => setProfileOpen(!profileOpen)}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="rl-topbar__profile-avatar"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="rl-topbar__profile-avatar">{initials}</div>
              )}
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