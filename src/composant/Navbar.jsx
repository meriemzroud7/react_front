import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import '../styles/navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <img
            src="/logof.png"
            alt="Fursa Logo"
            className="nav__brand-icon"
          />
          <span className="nav__brand-arabic">فرصة</span>
          <span className="nav__brand-name">Fursa</span>
        </Link>

        <div className="nav__links">
          <a href="#features">Fonctionnalités</a>
          <a href="#jobs">Offres</a>
          <a href="#testimonials">Témoignages</a>
          <div className="nav__auth">
            <Link to="/login" className="nav__login">Connexion</Link>
            <Link to="/register" className="nav__cta">Créer un compte</Link>
          </div>
        </div>

        <div className="nav__actions">
          <button className="nav__theme" onClick={toggleTheme} aria-label="Basculer le thème">
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button className="nav__burger" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="nav__mobile">
          <a href="#features" onClick={() => setIsOpen(false)}>Fonctionnalités</a>
          <a href="#jobs" onClick={() => setIsOpen(false)}>Offres</a>
          <a href="#testimonials" onClick={() => setIsOpen(false)}>Témoignages</a>
          <div className="nav__mobile-auth">
            <Link to="/login" className="nav__login nav__login--block">Connexion</Link>
            <Link to="/register" className="nav__cta nav__cta--block">Créer un compte</Link>
          </div>
        </div>
      )}
    </nav>
  );
}