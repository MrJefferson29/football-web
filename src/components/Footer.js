import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, FaPoll, FaFutbol, FaVideo, FaNewspaper, 
  FaTv, FaUsers, FaChartBar, FaGithub, FaTwitter, FaFacebook 
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const quickLinks = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/polls', icon: FaPoll, label: 'Polls' },
    { path: '/matches', icon: FaFutbol, label: 'Matches' },
    { path: '/highlights', icon: FaVideo, label: 'Highlights' },
    { path: '/news', icon: FaNewspaper, label: 'News' },
    { path: '/live-matches', icon: FaTv, label: 'Live Matches' },
    { path: '/fan-groups', icon: FaUsers, label: 'Fan Groups' },
    { path: '/statistics', icon: FaChartBar, label: 'Statistics' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <div className="footer-links">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path} className="footer-link">
                  <Icon className="footer-link-icon" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">About</h3>
          <p className="footer-text">
            Football Admin Panel - Manage polls, matches, highlights, news, and more.
            Built for efficient content management and user engagement.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Connect</h3>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="social-link" aria-label="Facebook">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Football Admin Panel. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

