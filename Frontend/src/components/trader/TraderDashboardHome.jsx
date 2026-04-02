import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './TraderDashboardHome.scss';

/**
 * Trader Dashboard Home component
 * Displays statistics and overview for trader
 */
const TraderDashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get('/api/orders/trader/dashboard/stats', {
        headers: { Authorization: token }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error.response?.data || error);
      // fallback na brak danych
      setStats({
        totalSales: 0,
        monthlySales: 0,
        topClient: null,
        topProduct: null
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Ładowanie statystyk...</div>;
  }

  return (
    <div className="trader-dashboard-home">
      <h1>Dashboard Handlowca</h1>

      <div className="stats-grid">
        {/* Sprzedaż ogółem */}
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Sprzedaż ogółem</h3>
            <p className="stat-value">{stats?.totalSales?.toFixed(2) || '0.00'} PLN</p>
          </div>
        </div>

        {/* Sprzedaż w bieżącym miesiącu */}
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Sprzedaż miesięczna</h3>
            <p className="stat-value">{stats?.monthlySales?.toFixed(2) || '0.00'} PLN</p>
          </div>
        </div>

        {/* Największy klient */}
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Największy klient</h3>
            <p className="stat-value">
              {stats?.topClient ? `${stats.topClient[1]?.toFixed(2)} PLN` : 'Brak danych'}
            </p>
          </div>
        </div>

        {/* Najbardziej sprzedający się produkt */}
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Najlepiej sprzedający produkt</h3>
            <p className="stat-value">
              {stats?.topProduct ? `${stats.topProduct[1]?.toFixed(2)} szt.` : 'Brak danych'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderDashboardHome;