import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin-layout.css';

export default function AdminProfil() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const fullName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : t('admin.userDefault');
  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || 'AD' : 'AD';
  const avatarUrl = user?.image ? `http://localhost:8080/${user.image}` : '';
  const platformLogo = (() => {
    try {
      return localStorage.getItem('platform_logo') || null;
    } catch (e) {
      return null;
    }
  })();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2>{t('admin.menu.profil')}</h2>
        <NavLink to="/admin/parametres" className="btn btn--secondary">
          <FiEdit2 style={{ marginRight: 8 }} />{t('admin.profile.settings')}
        </NavLink>
      </div>

      <div className="admin-card" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(0,0,0,0.06)' }}
            />
          ) : platformLogo ? (
            <img
              src={platformLogo}
              alt="Logo plateforme"
              style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(0,0,0,0.06)' }}
            />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: 12, background: 'var(--primary)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>
              {initials}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{fullName}</div>
            <div style={{ color: 'var(--muted)', marginTop: 6 }}>{user?.email || ''}</div>
            {user?.telephone && <div style={{ color: 'var(--muted)', marginTop: 6 }}>{user.telephone}</div>}
            {user?.role && <div style={{ color: 'var(--muted)', marginTop: 6 }}>{user.role}</div>}
          </div>
        </div>

        <hr style={{ margin: '1.25rem 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />

        <div>
          <h3 style={{ marginBottom: 8 }}>{t('admin.profile')}</h3>
          <div style={{ color: 'var(--muted)' }}>
            {/* Afficher plus d'infos si disponibles */}
            <p>{t('admin.userDefault')}: {fullName}</p>
            <p>Email: {user?.email || '—'}</p>
            <p>{t('admin.role')}: {user?.role || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}