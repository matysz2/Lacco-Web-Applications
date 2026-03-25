import React from 'react';
import LoginForm from '../components/LoginForm';
import './LoginPage.scss';

/**
 * Login page component
 * Renders the main login screen with form
 */
const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Zarządzanie sprzedażą i magazynem</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
