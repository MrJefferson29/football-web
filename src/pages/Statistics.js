import React, { useState, useEffect } from 'react';
import { FaChartBar, FaPoll, FaFutbol } from 'react-icons/fa';
import { statisticsAPI } from '../utils/api';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticsAPI.getStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="empty-state">No statistics available</div>;
  }

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>Statistics Dashboard</h1>
        <p>View voting statistics and analytics</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <FaPoll className="stat-icon" />
          <div className="stat-content">
            <h3>Total Poll Votes</h3>
            <p className="stat-value">{stats.overall?.totalPollVotes || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaFutbol className="stat-icon" />
          <div className="stat-content">
            <h3>Total Match Votes</h3>
            <p className="stat-value">{stats.overall?.totalMatchVotes || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaChartBar className="stat-icon" />
          <div className="stat-content">
            <h3>Total Votes</h3>
            <p className="stat-value">{stats.overall?.totalVotes || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaPoll className="stat-icon" />
          <div className="stat-content">
            <h3>Active Polls</h3>
            <p className="stat-value">{stats.overall?.activePolls || 0}</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Poll Statistics</h2>
        <div className="stats-grid">
          {stats.polls && stats.polls.length > 0 ? (
            stats.polls.map((poll) => (
              <div key={poll.id} className="poll-stat-card">
                <h3>{poll.question}</h3>
                <div className="poll-options-stats">
                  <div className="option-stat">
                    <span className="option-name">{poll.option1.name}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${poll.option1.percentage}%` }}
                      />
                    </div>
                    <span className="option-percentage">{poll.option1.percentage}%</span>
                    <span className="option-votes">({poll.option1.votes} votes)</span>
                  </div>
                  <div className="option-stat">
                    <span className="option-name">{poll.option2.name}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${poll.option2.percentage}%` }}
                      />
                    </div>
                    <span className="option-percentage">{poll.option2.percentage}%</span>
                    <span className="option-votes">({poll.option2.votes} votes)</span>
                  </div>
                </div>
                <p className="total-votes">Total: {poll.totalVotes} votes</p>
              </div>
            ))
          ) : (
            <div className="empty-state">No poll statistics available</div>
          )}
        </div>
      </div>

      <div className="stats-section">
        <h2>Match Statistics</h2>
        <div className="stats-grid">
          {stats.matches && stats.matches.length > 0 ? (
            stats.matches.map((match) => (
              <div key={match.id} className="match-stat-card">
                <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                <div className="match-votes-stats">
                  <div className="vote-stat">
                    <span>{match.homeTeam}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill home"
                        style={{ width: `${match.votes.homePercentage}%` }}
                      />
                    </div>
                    <span>{match.votes.homePercentage}% ({match.votes.home} votes)</span>
                  </div>
                  <div className="vote-stat">
                    <span>Draw</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill draw"
                        style={{ width: `${match.votes.drawPercentage}%` }}
                      />
                    </div>
                    <span>{match.votes.drawPercentage}% ({match.votes.draw} votes)</span>
                  </div>
                  <div className="vote-stat">
                    <span>{match.awayTeam}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill away"
                        style={{ width: `${match.votes.awayPercentage}%` }}
                      />
                    </div>
                    <span>{match.votes.awayPercentage}% ({match.votes.away} votes)</span>
                  </div>
                </div>
                <p className="total-votes">Total: {match.totalVotes} votes</p>
              </div>
            ))
          ) : (
            <div className="empty-state">No match statistics available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;

