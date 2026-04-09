import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './StatisticsPage.scss';

/**
 * Statistics Page component
 * Displays sales statistics and charts
 */
const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        api.get('/api/orders/dashboard/stats'),
        api.get('/api/orders')
      ]);
      setStats(statsResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate additional statistics
const calculateStats = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

    // Obliczanie przychodu (sumaBrutto) i wagi z pozycji zamówienia
    const totals = orders.reduce((acc, order) => {
      // 1. Sumowanie pieniędzy (obsługujemy różne możliwe nazwy pól)
      const amount = order.sumaBrutto || order.totalAmount || 0;
      acc.revenue += Number(amount);

      // 2. Sumowanie wagi - musimy zajrzeć do pozycji zamówienia (orderItems)
      // Jeśli produkt ma wagę, sumujemy: ilość * waga_jednostkowa
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          // Tutaj zakładamy, że waga może być w item.waga lub stała (np. 1kg na sztukę dla lakierów)
          // Jeśli nie ma wagi w bazie, na razie liczymy sztuki jako kg, żeby nie było 0
          const weight = item.waga || 1; 
          acc.weight += (item.ilosc * weight);
        });
      } else if (order.totalWeight) {
        acc.weight += order.totalWeight;
      }

      return acc;
    }, { revenue: 0, weight: 0 });

    return {
      totalOrders,
      completedOrders,
      totalRevenue: totals.revenue,
      totalWeight: totals.weight,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0
    };
  };

  if (loading) {
    return <div className="loading">Ładowanie statystyk...</div>;
  }

  const additionalStats = calculateStats();

  return (
    <div className="statistics-page">
      <h1>Statystyki sprzedaży</h1>

      <div className="stats-overview">
        <div className="stat-card large">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Całkowita sprzedaż</h3>
            <p className="stat-value">{additionalStats.totalRevenue.toFixed(2)} PLN</p>
          </div>
        </div>

        <div className="stat-card large">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <h3>Całkowita waga</h3>
            <p className="stat-value">{additionalStats.totalWeight.toFixed(2)} kg</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Zamówienia</h3>
            <p className="stat-value">{additionalStats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Zrealizowane</h3>
            <p className="stat-value">{additionalStats.completedOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Wskaźnik realizacji</h3>
            <p className="stat-value">{additionalStats.completionRate}%</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <h2>Podsumowanie miesięczne</h2>
        <div className="monthly-stats">
          <div className="stat-item">
            <span className="label">Sprzedaż w miesiącu:</span>
            <span className="value">{stats?.monthlySales?.toFixed(2) || '0.00'} PLN</span>
          </div>
          <div className="stat-item">
            <span className="label">Waga sprzedana:</span>
            <span className="value">{stats?.monthlyWeight?.toFixed(2) || '0.00'} kg</span>
          </div>
          <div className="stat-item">
            <span className="label">Zamówienia nowe:</span>
            <span className="value">{stats?.newOrdersCount || 0}</span>
          </div>
          <div className="stat-item">
            <span className="label">W trakcie realizacji:</span>
            <span className="value">{stats?.inProgressOrdersCount || 0}</span>
          </div>
        </div>
      </div>

<div className="top-performers">
        <h2>Najlepsi handlowcy</h2>
        <div className="performer-card">
          <h3>Ogólnie</h3>
          {stats?.topSalesmanOverall ? (
            <div className="performer-info">
              <p className="performer-name">
                {stats.topSalesmanOverall[0]} {stats.topSalesmanOverall[1]}
              </p>
              <p className="performer-value">
                Wynik: {Number(stats.topSalesmanOverall[2]).toFixed(2)} PLN
              </p>
            </div>
          ) : (
            <p>Brak danych</p>
          )}
        </div>

        <div className="performer-card">
          <h3>W bieżącym miesiącu</h3>
          {stats?.topSalesmanMonthly ? (
            <div className="performer-info">
              <p className="performer-name">
                {stats.topSalesmanMonthly[0]} {stats.topSalesmanMonthly[1]}
              </p>
              <p className="performer-value">
                Wynik: {Number(stats.topSalesmanMonthly[2]).toFixed(2)} PLN
              </p>
            </div>
          ) : (
            <p>Brak danych</p>
          )}
        </div>
      </div>
      </div>
  );
};

export default StatisticsPage;