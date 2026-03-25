import React, { useState } from 'react';
import api from '../services/api';
import './LoginForm.scss';

/**
 * Login form component
 * Handles user login with email and password
 * Calls API to authenticate against profiles table
 */
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      setError('Email i hasło są wymagane');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Nieprawidłowy format email');
      return false;
    }
    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd logowania. Spróbuj ponownie.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="twój.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Hasło</label>
        <input
          id="password"
          type="password"
          placeholder="Wpisz hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="form-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="login-button"
      >
        {isLoading ? 'Logowanie...' : 'Zaloguj się'}
      </button>

      <div className="login-footer">
        <a href="/forgot-password">Zapomniałeś hasła?</a>
      </div>
    </form>
  );
};

export default LoginForm;
