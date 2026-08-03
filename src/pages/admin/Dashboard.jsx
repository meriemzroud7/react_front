import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiUsers, FiBriefcase, FiFileText, FiClipboard, FiCalendar,
  FiAward, FiLoader, FiAlertCircle, FiAlertTriangle, FiClock
} from 'react-icons/fi';
import { getUsers } from '../../services/apiServiceUser';
import { getAllOffres } from '../../services/apiServiceOffres';
import CandidatureService from '../../services/apiServiceCandidature';
import { getEntretiens, getEntretienStats } from '../../services/apiServiceEntretien';

function getUserField(user, ...keys) {
  for (const k of keys) {
    if (user && user[k] !== undefined && user[k] !== null && user[k] !== '') return user[k];
  }
  return '';
}

function monthLabel(date) {
  return date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
}

function formatRelativeTime(dateIso) {
  if (!dateIso) return '';
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "À l'instant";
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ === 1) return 'Il y a 1 jour';
  return `Il y a ${diffJ} jours`;
}

const MONTHS_WINDOW = 6;

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [offres, setOffres] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [entretienStats, setEntretienStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, offresRes, candidaturesData, entretiensRes, statsRes] = await Promise.all([
          getUsers(),
          getAllOffres(),
          CandidatureService.getAll(),
          getEntretiens(),
          getEntretienStats(),
        ]);
        if (cancelled) return;

        setUsers(usersRes.data || []);
        setOffres(offresRes.data || []);
        setCandidatures(Array.isArray(candidaturesData) ? candidaturesData : []);
        setEntretiens(entretiensRes.data || []);
        setEntretienStats(statsRes.data || null);
      } catch (err) {
        console.error('Erreur lors du chargement du tableau de bord admin :', err);
        if (!cancelled) setError(t('admin.dashboardPage.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [t]);

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  // ── KPIs dérivés des vraies données ──────────────────────────
  const recruteurs = useMemo(() => users.filter((u) => (u.role || '').toUpperCase() === 'RECRUTEUR'), [users]);
  const candidats = useMemo(() => users.filter((u) => (u.role || '').toUpperCase() === 'CANDIDAT'), [users]);
  const entreprisesUniques = useMemo(
    () => new Set(offres.map((o) => o.nomEntreprise).filter(Boolean)).size,
    [offres]
  );
  const recrutementsFinalises = useMemo(
    () => candidatures.filter((c) => c.statut === 'RETENU').length,
    [candidatures]
  );

  const stats = useMemo(() => [
    { labelKey: 'utilisateurs', value: users.length, icon: <FiUsers />, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
    { labelKey: 'recruteurs', value: recruteurs.length, icon: <FiBriefcase />, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
    { labelKey: 'candidats', value: candidats.length, icon: <FiUsers />, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    { labelKey: 'entreprises', value: entreprisesUniques, icon: <FiBriefcase />, color: '#be185d', bg: 'rgba(190,24,93,0.1)' },
    { labelKey: 'offres', value: offres.length, icon: <FiFileText />, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    { labelKey: 'candidaturesLabel', value: candidatures.length, icon: <FiClipboard />, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    { labelKey: 'entretiensRealises', value: entretienStats?.termines ?? 0, icon: <FiCalendar />, color: '#1e4fa3', bg: 'rgba(30,79,163,0.1)' },
    { labelKey: 'recrutementsFinalises', value: recrutementsFinalises, icon: <FiAward />, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  ], [users, recruteurs, candidats, entreprisesUniques, offres, candidatures, entretienStats, recrutementsFinalises]);

  // ── Évolution mensuelle réelle : offres publiées + candidatures reçues ──
  const monthly = useMemo(() => {
    const buckets = [];
    const now = new Date();
    for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: monthLabel(d), offres: 0, candidatures: 0 });
    }
    const bucketByKey = Object.fromEntries(buckets.map((b) => [b.key, b]));

    offres.forEach((o) => {
      if (!o.dateCreation) return;
      const d = new Date(o.dateCreation);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (bucketByKey[key]) bucketByKey[key].offres += 1;
    });

    candidatures.forEach((c) => {
      if (!c.dateCandidature) return;
      const d = new Date(c.dateCandidature);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (bucketByKey[key]) bucketByKey[key].candidatures += 1;
    });

    return buckets;
  }, [offres, candidatures]);

  const maxValue = Math.max(1, ...monthly.map((m) => Math.max(m.offres, m.candidatures)));

  // ── Alertes opérationnelles, calculées à partir de données réelles uniquement ──
  const alerts = useMemo(() => {
    const list = [];

    const now = Date.now();
    const pendingOld = candidatures.filter((c) => {
      if (c.statut !== 'EN_ATTENTE' || !c.dateCandidature) return false;
      const ageJours = (now - new Date(c.dateCandidature).getTime()) / (1000 * 60 * 60 * 24);
      return ageJours > 14;
    }).length;
    if (pendingOld > 0) {
      list.push({ level: 'amber', text: t('admin.dashboardPage.alertPendingOld', { count: pendingOld }) });
    }

    const in48h = entretiens.filter((e) => {
      if (!e.date) return false;
      const d = new Date(`${e.date}T${e.heure || '00:00'}`);
      const diffH = (d.getTime() - now) / (1000 * 60 * 60);
      return diffH >= 0 && diffH <= 48 && ['PROGRAMME', 'CONFIRME'].includes(e.statut);
    }).length;
    if (in48h > 0) {
      list.push({ level: 'blue', text: t('admin.dashboardPage.alertUpcomingInterviews', { count: in48h }) });
    }

    return list;
  }, [candidatures, entretiens, t]);

  // ── Activités récentes réelles : offres, candidatures et entretiens les plus récents ──
  const activities = useMemo(() => {
    const fromOffres = offres
      .filter((o) => o.dateCreation)
      .map((o) => ({ text: `Nouvelle offre publiée : « ${o.titre} »${o.nomEntreprise ? ` (${o.nomEntreprise})` : ''}`, date: o.dateCreation }));

    const fromCandidatures = candidatures
      .filter((c) => c.dateCandidature)
      .map((c) => {
        const candidat = usersById[c.candidatId];
        const nom = candidat ? `${getUserField(candidat, 'prenom')} ${getUserField(candidat, 'nom')}`.trim() : 'Un candidat';
        return { text: `${nom || 'Un candidat'} a déposé une nouvelle candidature`, date: c.dateCandidature };
      });

    const fromEntretiens = entretiens
      .filter((e) => e.date)
      .map((e) => ({ text: `Entretien ${e.statut === 'TERMINE' ? 'terminé' : e.statut === 'CONFIRME' ? 'confirmé' : 'programmé'} pour le poste « ${e.poste || '—'} »`, date: e.date }));

    return [...fromOffres, ...fromCandidatures, ...fromEntretiens]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map((a) => ({ text: a.text, time: formatRelativeTime(a.date) }));
  }, [offres, candidatures, entretiens, usersById]);

  if (loading) {
    return (
      <div className="rp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
        <FiLoader className="rp-spin" /> {t('admin.dashboardPage.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
        <FiAlertCircle size={28} color="var(--danger, #dc2626)" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rp-header">
        <div className="rp-header__top">
          <div>
            <h1 className="rp-title">{t('admin.dashboardPage.title')}</h1>
            <p className="rp-subtitle">{t('admin.dashboardPage.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="rp-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {stats.map((s, i) => (
          <div key={i} className="rp-stat">
            <div className="rp-stat__icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="rp-stat__value">{s.value}</div>
            <div className="rp-stat__label">{t(`admin.dashboardPage.stats.${s.labelKey}`)}</div>
          </div>
        ))}
      </div>

      <div className="rp-grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', marginBottom: '1.25rem' }}>
        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">{t('admin.dashboardPage.evolutionTitle')}</span>
          </div>
          <div className="rp-card__body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: 180 }}>
              {monthly.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: '100%' }}>
                    <div title={`${d.offres} offres`} style={{ width: 14, borderRadius: 4, background: 'var(--primary)', height: `${(d.offres / maxValue) * 100}%` }} />
                    <div title={`${d.candidatures} candidatures`} style={{ width: 14, borderRadius: 4, background: 'var(--accent)', height: `${(d.candidatures / maxValue) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{d.month}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--primary)', marginRight: 6 }} />{t('admin.dashboardPage.legendOffres')}</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--accent)', marginRight: 6 }} />{t('admin.dashboardPage.legendCandidatures')}</span>
            </div>
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card__header">
            <span className="rp-card__title">{t('admin.dashboardPage.alertsTitle')}</span>
          </div>
          <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>{t('admin.dashboardPage.noAlerts')}</p>
            )}
            {alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', borderRadius: 10, background: 'var(--background)' }}>
                {a.level === 'amber' ? <FiAlertTriangle color="var(--accent-dark)" /> : <FiClock color="var(--primary)" />}
                <span style={{ fontSize: '0.82rem', color: 'var(--foreground)' }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-card__header">
          <span className="rp-card__title">{t('admin.dashboardPage.activitiesTitle')}</span>
        </div>
        <div className="rp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {activities.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>{t('admin.dashboardPage.noActivities')}</p>
          )}
          {activities.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.9rem', borderBottom: i < activities.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{a.text}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}