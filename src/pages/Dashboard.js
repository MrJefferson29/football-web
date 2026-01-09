import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPoll,
  FaFutbol,
  FaVideo,
  FaNewspaper,
  FaTv,
  FaUsers,
  FaChartBar,
  FaArrowRight,
  FaVoteYea,
  FaCalendarAlt,
  FaEye,
  FaComments,
  FaShoppingBag,
  FaTrophy,
} from 'react-icons/fa';
import { statisticsAPI, matchesAPI, highlightsAPI, newsAPI, liveMatchesAPI, fanGroupsAPI, pollsAPI, productsAPI, predictionForumsAPI } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalMatches: 0,
    totalHighlights: 0,
    totalNews: 0,
    totalLiveMatches: 0,
    totalFanGroups: 0,
    totalProducts: 0,
    totalPredictionForums: 0,
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, matchesRes, highlightsRes, newsRes, liveMatchesRes, fanGroupsRes, pollsRes, productsRes, predictionForumsRes] = await Promise.all([
        statisticsAPI.getStatistics().catch(() => ({ data: { overall: { totalVotes: 0 } } })),
        matchesAPI.getMatches().catch(() => ({ data: [] })),
        highlightsAPI.getHighlights().catch(() => ({ data: [] })),
        newsAPI.getNews().catch(() => ({ data: [] })),
        liveMatchesAPI.getLiveMatches().catch(() => ({ data: [] })),
        fanGroupsAPI.getFanGroups().catch(() => ({ data: [] })),
        pollsAPI.getPolls().catch(() => ({ data: [] })),
        productsAPI.getProducts().catch(() => ({ data: [] })),
        predictionForumsAPI.getPredictionForums().catch(() => ({ success: false, data: [] })),
      ]);

      setStats({
        totalPolls: pollsRes.data?.length || 0,
        totalMatches: matchesRes.data?.length || 0,
        totalHighlights: highlightsRes.data?.length || 0,
        totalNews: newsRes.data?.length || 0,
        totalLiveMatches: liveMatchesRes.data?.length || 0,
        totalFanGroups: fanGroupsRes.data?.length || 0,
        totalProducts: productsRes.data?.length || 0,
        totalPredictionForums: predictionForumsRes.data?.length || 0,
        totalVotes: statsRes.data?.overall?.totalVotes || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      title: 'Manage Polls',
      description: 'Create and edit daily polls, club battles, and goat competitions',
      icon: FaPoll,
      path: '/polls',
      color: '#8B5CF6',
      stat: stats.totalPolls,
    },
    {
      title: 'International Leagues',
      description: 'Add and update international football matches',
      icon: FaFutbol,
      path: '/matches',
      color: '#10B981',
      stat: stats.totalMatches,
    },
    {
      title: 'Local Leagues',
      description: 'Add and update local football matches',
      icon: FaFutbol,
      path: '/local-leagues',
      color: '#3B82F6',
      stat: 0,
    },
    {
      title: 'Inter-Quarter League',
      description: 'Add and update inter-quarter football matches',
      icon: FaFutbol,
      path: '/inter-quarter-league',
      color: '#F59E0B',
      stat: 0,
    },
    {
      title: 'Highlights',
      description: 'Upload and manage football highlights videos',
      icon: FaVideo,
      path: '/highlights',
      color: '#EF4444',
      stat: stats.totalHighlights,
    },
    {
      title: 'News & Trending',
      description: 'Create news articles and trending content',
      icon: FaNewspaper,
      path: '/news',
      color: '#3B82F6',
      stat: stats.totalNews,
    },
    {
      title: 'Live Matches',
      description: 'Manage live streaming matches and comments',
      icon: FaTv,
      path: '/live-matches',
      color: '#F59E0B',
      stat: stats.totalLiveMatches,
    },
    {
      title: 'Fan Groups',
      description: 'Create fan groups and manage posts',
      icon: FaUsers,
      path: '/fan-groups',
      color: '#EC4899',
      stat: stats.totalFanGroups,
    },
    {
      title: 'Prediction Forums',
      description: 'Manage prediction forums and assign forum heads',
      icon: FaTrophy,
      path: '/prediction-forums',
      color: '#F59E0B',
      stat: stats.totalPredictionForums,
    },
    {
      title: 'Statistics',
      description: 'View voting statistics and analytics',
      icon: FaChartBar,
      path: '/statistics',
      color: '#06B6D4',
      stat: stats.totalVotes,
    },
    {
      title: 'Shop Products',
      description: 'Manage sports items, jerseys, shoes, and accessories',
      icon: FaShoppingBag,
      path: '/products',
      color: '#EC4899',
      stat: stats.totalProducts,
    },
  ];

  const statCards = [
    { label: 'Total Votes', value: stats.totalVotes, icon: FaVoteYea, color: '#3B82F6' },
    { label: 'Active Matches', value: stats.totalMatches, icon: FaCalendarAlt, color: '#10B981' },
    { label: 'Highlights', value: stats.totalHighlights, icon: FaEye, color: '#EF4444' },
    { label: 'Fan Groups', value: stats.totalFanGroups, icon: FaComments, color: '#EC4899' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your football app content and features</p>
      </div>

      {!loading && (
        <div className="stats-grid">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <Icon />
                </div>
                <div className="stat-content">
                  <h3>{stat.value.toLocaleString()}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="dashboard-grid">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} className="dashboard-card">
                <div className="card-icon" style={{ backgroundColor: `${link.color}20`, color: link.color }}>
                  <Icon />
                </div>
                <div className="card-content">
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                      {link.stat !== undefined && (
                        <span className="card-stat" style={{ color: link.color }}>
                          {link.stat} {link.title.includes('Polls') ? 'polls' : link.title.includes('Matches') ? 'matches' : link.title.includes('Highlights') ? 'videos' : link.title.includes('News') ? 'articles' : link.title.includes('Groups') ? 'groups' : link.title.includes('Prediction Forums') ? 'forums' : 'items'}
                        </span>
                      )}
                </div>
                <div className="card-arrow">
                  <FaArrowRight />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

