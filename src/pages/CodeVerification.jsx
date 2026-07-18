import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiRefreshCw, FiLoader } from 'react-icons/fi';
import '../styles/auth.css';

const CODE_LENGTH = 6;

export default function CodeVerification() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index, value) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    setIsError(false);
    if (v && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
  };

  const code = digits.join('');
  const isFilled = code.length === CODE_LENGTH;

  const handleVerify = () => {
    if (!isFilled) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (code === '123456') {
        setIsSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setIsError(true);
        setDigits(Array(CODE_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
      }
    }, 1200);
  };

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(59);
    setDigits(Array(CODE_LENGTH).fill(''));
    setIsError(false);
    inputsRef.current[0]?.focus();
  };

  if (isSuccess) {
    return (
      <div className="verify">
        <div className="verify__card fade-in-up">
          <div className="verify__icon verify__icon--success"><FiCheckCircle size={30} /></div>
          <h1>Compte vérifié !</h1>
          <p className="verify__sub">Redirection vers votre espace Fursa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify">
      <div className="verify__card fade-in-up">
        <a href="/" className="verify__back"><FiArrowLeft size={14} /> Retour</a>

        <div className="verify__icon"><FiMail size={28} /></div>
        <h1>Vérifiez votre e-mail</h1>
        <p className="verify__sub">
          Entrez le code à 6 chiffres envoyé à votre adresse e-mail. (Code de démo : <strong>123456</strong>)
        </p>

        <div className="verify__digits" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`verify__digit ${isError ? 'verify__digit--error' : ''}`}
            />
          ))}
        </div>

        {isError && <p className="verify__error">Code incorrect. Réessayez.</p>}

        <button className="verify__submit" onClick={handleVerify} disabled={!isFilled || isVerifying}>
          {isVerifying ? (
            <><FiLoader className="auth__spinner" /> Vérification...</>
          ) : (
            'Vérifier le code'
          )}
        </button>

        <div className="verify__resend">
          {canResend ? (
            <button onClick={handleResend}><FiRefreshCw size={14} style={{ marginRight: 4 }} /> Renvoyer le code</button>
          ) : (
            <span>Renvoyer le code dans {countdown}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
