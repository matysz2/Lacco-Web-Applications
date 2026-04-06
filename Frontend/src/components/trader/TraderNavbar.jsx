import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './TraderNavbar.scss';
import iconLogo from '../../assets/icon.png';


/**
 * Trader Navbar component
 * Navigation bar for trader dashboard with hamburger menu for mobile
 */
const TraderNavbar = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/trader/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/trader/customers', label: 'Moi klienci', icon: '👥' },
    { path: '/trader/products', label: 'Towary', icon: '📦' },
    { path: '/trader/sales', label: 'Sprzedaż', icon: '💼' },
    { path: '/trader/pricing', label: 'Ustawienie cen', icon: '💲' },
    { path: '/trader/account', label: 'Ustawienie konta', icon: '⚙️' },
  ];

 return (
    <nav className="trader-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          {/* Używamy zaimportowanej zmiennej w klamrach {} */}
          <img src={iconLogo} alt="Lacco" className="brand-logo" />
        </div>

        {/* User Info */}
        <div className="user-info">
          <span className="user-name">
            {user?.firstName} {user?.lastName}
          </span>
        </div>

        {/* Desktop Menu */}
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

        {/* Logout Button */}
        <div className="navbar-actions">
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Wyloguj się"
          >
            🚪 
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle">
          <button
            className="hamburger-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
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
            onClick={() => {
              closeMobileMenu();
              handleLogout();
            }}
          >
            🚪Wyloguj się
          </button>
        </div>
      )}
    </nav>
  );
};

export default TraderNavbar;