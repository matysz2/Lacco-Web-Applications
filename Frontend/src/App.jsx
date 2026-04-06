import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TraderDashboard from './pages/trader/TraderDashboard';
import './App.css';

/**
 * Main App component with routing
 * Routes all application pages including:
 * - Login page
 * - Forgot password page (request reset link)
 * - Reset password page (set new password via token)
 * - Admin dashboard with all admin views:
 *   - Dashboard home
 *   - Handlowcy (Salesmen)
 *   - Klienci (Customers)
 *   - Statystyki (Statistics)
 *   - Magazyn (Warehouse)
 *   - Zamowienia (Orders)
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        
        {/* Trader routes */}
        <Route path="/trader/*" element={<TraderDashboard />} />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
