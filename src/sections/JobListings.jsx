import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiBriefcase, FiClock, FiArrowRight } from 'react-icons/fi';
import { RiSparklingLine } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { getAllOffres, getMatchScore } from '../services/apiServiceOffres';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';
const LOGO_TONES = ['blue', 'indigo', 'purple', 'green'];

function formaterDate(date) {
  if (!date) return '';
  const diffJours = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diffJours <= 0) return "Aujourd'hui";
  if (diffJours === 1) return 'Il y a 1 jour';
  if (diffJours < 30) return `Il y a ${diffJours} jours`;
  return new Date(date).toLocaleDateString('fr-FR');
}

function JobCardSkeleton() {
  return (
    <div className="jobs__card jobs__card--skeleton">
      <div className="jobs__card-top">
        <div className="jobs__skeleton jobs__skeleton--logo" />
        <div className="jobs__skeleton jobs__skeleton--pill" />
      </div>
      <div className="jobs__skeleton jobs__skeleton--line" style={{ width: '70%' }} />
      <div className="jobs__skeleton jobs__skeleton--line" style={{ width: '50%' }} />
      <div className="jobs__skeleton jobs__skeleton--line" style={{ width: '60%' }} />
      <div className="jobs__skeleton jobs__skeleton--button" />
    </div>
  );
}

export default function JobListings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let annule = false;

    async function charger() {
      try {
        const { data } = await getAllOffres();
        const recentes = [...data]
          .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
          .slice(0, 4);

        if (annule) return;
        setJobs(recentes);

        if (user?.id && recentes.length) {
          const resultats = await Promise.allSettled(
            recentes.map((job) => getMatchScore(user.id, job.id))
          );
          if (annule) return;
          const scoresMap = {};
          resultats.forEach((res, i) => {
            if (res.status === 'fulfilled') {
              scoresMap[recentes[i].id] = res.value.data.matchScore;
            }
          });
          setScores(scoresMap);
        }
      } catch (err) {
        console.error('Erreur chargement des offres :', err);
      } finally {
        if (!annule) setLoading(false);
      }
    }

    charger();
    return () => { annule = true; };
  }, [user]);

  return (
    <section id="jobs" className="jobs">
      <div className="container">
        <div className="jobs__header">
          <div>
            <h2>{t('jobs.title')}</h2>
            <p>{t('jobs.description')}</p>
          </div>
        </div>

        <div className="jobs__grid">
          {loading && Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}

          {!loading && jobs.length === 0 && (
            <div className="jobs__empty">
              <FiBriefcase size={28} />
              <p>{t('jobs.empty', 'Aucune offre disponible pour le moment.')}</p>
            </div>
          )}

          {!loading && jobs.map((job, index) => {
            const tone = LOGO_TONES[index % LOGO_TONES.length];
            const score = scores[job.id];

            return (
              <div className="jobs__card fade-in-up" key={job.id}>
                <div className="jobs__card-top">
                  {job.logoEntreprise ? (
                    <img
                      className="jobs__logo jobs__logo--img"
                      src={`${API_BASE_URL}${job.logoEntreprise}`}
                      alt={job.nomEntreprise}
                    />
                  ) : (
                    <div className={`jobs__logo jobs__logo--${tone}`}>
                      {job.nomEntreprise?.substring(0, 2).toUpperCase() || '?'}
                    </div>
                  )}

                  {score !== undefined ? (
                    <div className="jobs__match">
                      <RiSparklingLine size={12} /> {score}% match
                    </div>
                  ) : (
                    <div className="jobs__new">{t('jobs.new', 'Nouveau')}</div>
                  )}
                </div>

                <h3>{job.titre}</h3>

                <div className="jobs__meta">
                  <div><FiBriefcase size={16} /><span>{job.nomEntreprise}</span></div>
                  <div><FiMapPin size={16} /><span>{job.localisation}</span></div>
                  <div><FiClock size={16} /><span>{formaterDate(job.dateCreation)}</span></div>
                </div>

                <Link
                  to={user ? `/candidat/offres/${job.id}` : '/register'}
                  className="jobs__apply"
                >
                  {t('jobs.apply')} <FiArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}