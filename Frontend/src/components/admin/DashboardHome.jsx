import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DashboardHome.scss';

/**
 * Dashboard Home component
 * Displays statistics and overview for admin
 */
const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/orders/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error.response?.data || error);
      // fallback na brak danych, by komponent nie łamał się przypadkiem 401/500
      setStats({
        monthlySales: 0,
        monthlyWeight: 0,
        topSalesmanOverall: null,
        topSalesmanMonthly: null,
        newOrdersCount: 0,
        inProgressOrdersCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTopSalesman = (topSalesman) => {
    if (!Array.isArray(topSalesman) || topSalesman.length < 3 || topSalesman[0] == null) {
      return 'Brak danych';
    }
    return `${topSalesman[0]} ${topSalesman[1]}`;
  };

  if (loading) {
    return <div className="loading">Ładowanie statystyk...</div>;
  }

  return (
    <div className="dashboard-home">
      <h1>Dashboard Administratora</h1>

      <div className="stats-grid">
        {/* Sprzedaż w bieżącym miesiącu */}
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Sprzedaż w miesiącu</h3>
            <p className="stat-value">{stats?.monthlySales?.toFixed(2) || '0.00'} PLN</p>
          </div>
        </div>

        {/* Waga sprzedana w miesiącu */}
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <h3>Waga sprzedana</h3>
            <p className="stat-value">{stats?.monthlyWeight?.toFixed(2) || '0.00'} kg</p>
          </div>
        </div>

        {/* Najlepszy handlowiec ogólnie */}
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Najlepszy handlowiec</h3>
            <p className="stat-value">
              {formatTopSalesman(stats?.topSalesmanOverall)}
            </p>
          </div>
        </div>

        {/* Najlepszy handlowiec w miesiącu */}
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Najlepszy w miesiącu</h3>
            <p className="stat-value">
              {formatTopSalesman(stats?.topSalesmanMonthly)}
            </p>
          </div>
        </div>

        {/* Zamówienia nowe */}
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Zamówienia nowe</h3>
            <p className="stat-value">{stats?.newOrdersCount || 0}</p>
          </div>
        </div>

        {/* Zamówienia w trakcie */}
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>W trakcie realizacji</h3>
            <p className="stat-value">{stats?.inProgressOrdersCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;