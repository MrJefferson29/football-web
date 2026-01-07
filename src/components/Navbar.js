import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaPoll, FaFutbol, FaVideo, FaNewspaper, 
  FaTv, FaUsers, FaChartBar, FaShoppingBag, FaSignOutAlt, FaBars, FaTimes 
} from 'react-icons/fa';
import { authAPI } from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/polls', icon: FaPoll, label: 'Polls' },
    { path: '/matches', icon: FaFutbol, label: 'Matches' },
    { path: '/highlights', icon: FaVideo, label: 'Highlights' },
    { path: '/news', icon: FaNewspaper, label: 'News' },
    { path: '/live-matches', icon: FaTv, label: 'Live Matches' },
    { path: '/fan-groups', icon: FaUsers, label: 'Fan Groups' },
    { path: '/statistics', icon: FaChartBar, label: 'Statistics' },
    { path: '/products', icon: FaShoppingBag, label: 'Shop Products' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <FaFutbol className="brand-icon" />
            <span className="brand-text">Football Admin</span>
          </Link>
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="navbar-item">
                <Link
                  to={item.path}
                  className={`navbar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="navbar-icon" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="navbar-item">
            <button className="navbar-link logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="navbar-icon" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

