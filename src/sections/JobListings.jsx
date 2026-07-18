import { FiMapPin, FiBriefcase, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { RiSparklingLine } from 'react-icons/ri';

const jobs = [
  { title: 'Software Engineer', company: 'Vermeg', location: 'Tunis', salary: '3500 - 5000 TND', match: 94, logo: 'V', color: 'blue' },
  { title: 'Data Analyst', company: 'Telnet', location: 'Tunis', salary: '2800 - 4200 TND', match: 88, logo: 'T', color: 'indigo' },
  { title: 'UX Designer', company: 'Digital Mania', location: 'Sfax', salary: '2000 - 3000 TND', match: 91, logo: 'DM', color: 'purple' },
  { title: 'DevOps Engineer', company: 'Proxym Group', location: 'Sousse', salary: '3200 - 4800 TND', match: 85, logo: 'P', color: 'green' },
];

export default function JobListings() {
  return (
    <section id="jobs" className="jobs">
      <div className="container">
        <div className="jobs__header">
          <div>
            <h2>Recommandations intelligentes</h2>
            <p>Des opportunités sélectionnées par l'IA selon votre profil.</p>
          </div>
          <button className="jobs__see-all">
            Voir toutes les offres <FiArrowRight size={18} />
          </button>
        </div>

        <div className="jobs__grid">
          {jobs.map((job) => (
            <div className="jobs__card" key={job.title}>
              <div className="jobs__card-top">
                <div className={`jobs__logo jobs__logo--${job.color}`}>{job.logo}</div>
                <div className="jobs__match">
                  <RiSparklingLine size={12} /> {job.match}% match
                </div>
              </div>

              <h3>{job.title}</h3>

              <div className="jobs__meta">
                <div><FiBriefcase size={16} /><span>{job.company}</span></div>
                <div><FiMapPin size={16} /><span>{job.location}</span></div>
                <div><FiDollarSign size={16} /><span>{job.salary}</span></div>
              </div>

              <button className="jobs__apply">Postuler</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
