import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminNavbar.scss';
import iconLogo from '../../assets/icon.png';

const AdminNavbar = ({ onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { path: '/admin/dashboard', label: 'Strona główna', icon: '🏠' },
    { path: '/admin/handlowcy', label: 'Handlowcy', icon: '👥' },
    { path: '/admin/klienci', label: 'Klienci', icon: '👤' },
    { path: '/admin/statystyki', label: 'Statystyki', icon: '📊' },
    { path: '/admin/magazyn', label: 'Magazyn', icon: '📦' },
    { path: '/admin/zamowienia', label: 'Zamówienia', icon: '📋' },
  ];

  return (
    <nav className="admin-navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="navbar-brand">
          <img src={iconLogo} alt="Lacco" className="brand-logo" />
          <span className="brand-text">Lacco</span>
        </div>

        {/* MENU DESKTOP */}
        <div className="navbar-menu desktop-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* AKCJE (WYLOGUJ) */}
        <div className="navbar-actions">
          <button
            className="logout-btn tooltip-wrapper"
            onClick={onLogout}
          >
            <span className="logout-icon">🚪</span>
            <span className="tooltip-text">Wyloguj się</span>
          </button>
        </div>

        {/* HAMBURGER (MOBILE) */}
        <div className="mobile-menu-toggle">
          <button className="hamburger-btn" onClick={toggleMobileMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* MENU MOBILNE */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
            </Link>
          ))}
          <button
            className="mobile-logout-btn"
            onClick={() => { closeMobileMenu(); onLogout(); }}
          >
            🚪 Wyloguj się
          </button>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;