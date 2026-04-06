import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ForgotPasswordPage.scss';

/**
 * Forgot Password Page component
 * Allows users to request a password reset email
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Podaj prawidłowy adres email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/request-password-reset', { email });
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError(
        error.response?.data?.error ||
        'Nie udało się wysłać linku resetowania hasła. Sprawdź adres email.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-message">
            <h2>✓ Wiadomość wysłana!</h2>
            <p>
              Link do resetowania hasła został wysłany na Twój adres email.
            </p>
            <p className="small-text">
              Link będzie ważny przez 24 godziny.
            </p>
            <p className="redirect-text">
              Przekierowanie do strony logowania za 5 sekund...
            </p>
            <Link to="/login" className="back-to-login-btn">
              Wróć do logowania
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h2>Resetowanie hasła</h2>
        <p className="description">
          Podaj swój adres email, a my wyślemy Ci link do resetowania hasła.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Adres email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj.email@example.com"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Wysyłanie...' : 'Wyślij link resetowania'}
          </button>
        </form>

        <div className="login-link">
          <p>
            Pamiętasz hasło?{' '}
            <Link to="/login">Wróć do logowania</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
