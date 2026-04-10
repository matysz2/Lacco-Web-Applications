import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; // Używamy Twojego skonfigurowanego serwisu api
import './TraderDashboardHome.scss';

/**
 * Trader Dashboard Home - Wersja Stabilna (Produkcyjna)
 * Zabezpieczenia: 
 * 1. Bearer Token w nagłówku
 * 2. Obsługa null/undefined dla .toFixed()
 * 3. Obsługa błędów ESLint (nieużywane zmienne)
 */
const TraderDashboardHome = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlySales: 0,
    topClient: null,
    topProduct: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funkcja pobierająca dane - zdefiniowana przez useCallback, aby uniknąć pętli w useEffect
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      // Ważne: Dodajemy prefiks 'Bearer ' zgodnie ze standardem Spring Security
      const response = await api.get('/api/orders/trader/dashboard/stats', {
        headers: { 
          Authorization: token ? `Bearer ${token}` : '' 
        }
      });

      console.log('[DEBUG] Otrzymane dane:', response.data);

      // Zabezpieczamy stan przed nullem z backendu
      setStats({
        totalSales: response.data?.totalSales ?? 0,
        monthlySales: response.data?.monthlySales ?? 0,
        topClient: response.data?.topClient || null,
        topProduct: response.data?.topProduct || null
      });

    } catch (err) {
      // Używamy 'err', aby linter nie zgłaszał błędu
      console.error('Błąd podczas pobierania statystyk:', err.message);
      
      setError('Nie udało się załadować danych. Spróbuj ponownie później.');
      
      // Fallback - zerujemy statystyki przy błędzie
      setStats({
        totalSales: 0,
        monthlySales: 0,
        topClient: null,
        topProduct: null
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Pomocnik do bezpiecznego formatowania liczb (obsługuje null i brak danych)
  const formatValue = (value, suffix = 'PLN') => {
    if (value === null || value === undefined) return `0.00 ${suffix}`;
    return `${Number(value).toFixed(2)} ${suffix}`;
  };

  // Pomocnik do obsługi danych tablicowych (Top Klient / Top Produkt)
  const formatTopStat = (data, suffix = 'PLN') => {
    if (!data || !Array.isArray(data) || data[0] === null) {
      return 'Brak danych';
    }
    const label = data[0];
    const val = data[1] ?? 0;
    return `${label} (${formatValue(val, suffix)})`;
  };

  if (loading) {
    return <div className="loading">Inicjalizacja dashboardu...</div>;
  }

  return (
    <div className="trader-dashboard-home">
      <header className="dashboard-header">
        <h1>Dashboard Handlowca</h1>
        {error && <span className="error-badge">{error}</span>}
      </header>

      <div className="stats-grid">
        {/* Sprzedaż ogółem */}
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Sprzedaż ogółem</h3>
            <p className="stat-value">{formatValue(stats.totalSales)}</p>
          </div>
        </div>

        {/* Sprzedaż w bieżącym miesiącu */}
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Sprzedaż miesięczna</h3>
            <p className="stat-value">{formatValue(stats.monthlySales)}</p>
          </div>
        </div>

        {/* Największy klient */}
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Kluczowy klient</h3>
            <p className="stat-value">
              {formatTopStat(stats.topClient, 'PLN')}
            </p>
          </div>
        </div>

        {/* Najlepiej sprzedający produkt */}
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Top produkt</h3>
            <p className="stat-value">
              {formatTopStat(stats.topProduct, 'szt.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderDashboardHome;