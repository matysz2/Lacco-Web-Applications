import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ResetPasswordPage.scss';

/**
 * Reset Password Page component
 * Allows users to set their password using a reset token
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Brak tokena resetowania hasła w URL');
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }
    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', null, {
        params: {
          token: token,
          newPassword: formData.password
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.error || 'Błąd podczas ustawiania hasła');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <h2>Hasło zostało ustawione!</h2>
          <p>Możesz teraz zalogować się do systemu.</p>
          <p>Przekierowanie do strony logowania za 3 sekundy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2>Ustawienie hasła</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Nowe hasło:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength="6"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading || !token}>
            {loading ? 'Ustawianie hasła...' : 'Ustaw hasło'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;