import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import DashboardHome from '../../components/admin/DashboardHome';
import SalesmenPage from '../../components/admin/SalesmenPage';
import CustomersPage from '../../components/admin/CustomersPage';
import StatisticsPage from '../../components/admin/StatisticsPage';
import WarehousePage from '../../components/admin/WarehousePage';
import OrdersPage from '../../components/admin/OrdersPage';
import './AdminDashboard.scss';

/**
 * Admin Dashboard component
 * Main dashboard for admin users with navigation
 */
const AdminDashboard = () => {
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
      if (response.data.role !== 'ADMIN') {
        // Redirect based on role
        if (response.data.role === 'HANDLOWIEC') {
          navigate('/trader/dashboard');
        } else {
          navigate('/login');
        }
        return;
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return <div className="loading">Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-dashboard">
      <AdminNavbar onLogout={handleLogout} />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/handlowcy" element={<SalesmenPage />} />
          <Route path="/klienci" element={<CustomersPage />} />
          <Route path="/statystyki" element={<StatisticsPage />} />
          <Route path="/magazyn" element={<WarehousePage />} />
          <Route path="/zamowienia" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;