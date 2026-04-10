import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TraderNavbar from '../../components/trader/TraderNavbar';
import TraderDashboardHome from '../../components/trader/TraderDashboardHome';
import CustomersPage from '../../components/trader/CustomersPage';
import ProductsPage from '../../components/trader/ProductsPage';
import SalesPage from '../../components/trader/SalesPage';
import PricingPage from '../../components/trader/PricingPage';
import AccountSettingsPage from '../../components/trader/AccountSettingsPage';
import './TraderDashboard.scss';

/**
 * Trader Dashboard component
 * Main dashboard for trader users with navigation
 */
const TraderDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: token }
      });
      setUser(response.data);
      if (response.data.role !== 'TRADER') {
        // Redirect based on role
        if (response.data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/login');
        }
        return;
      }
    
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="trader-dashboard">
      <TraderNavbar user={user} />
      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="/trader/dashboard" replace />} />
          <Route path="/dashboard" element={<TraderDashboardHome />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/account" element={<AccountSettingsPage />} />
          <Route path="*" element={<Navigate to="/trader/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default TraderDashboard;