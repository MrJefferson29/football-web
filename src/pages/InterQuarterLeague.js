import React, { useState, useEffect, useRef } from 'react';
import { FaFutbol, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaSpinner } from 'react-icons/fa';
import { matchesAPI, uploadAPI } from '../utils/api';
import './Matches.css';

const InterQuarterLeague = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    homeLogo: '',
    awayLogo: '',
    matchTime: '',
    matchDate: '',
    league: '',
    leagueType: 'inter-quarter',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState({ homeLogo: false, awayLogo: false });
  const homeLogoInputRef = useRef(null);
  const awayLogoInputRef = useRef(null);
  const [scoreInputs, setScoreInputs] = useState({});
  const [savingScore, setSavingScore] = useState({});

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.getMatches({ leagueType: 'inter-quarter' });
      if (response.success) {
        setMatches(response.data);
        // Initialize score inputs
        const initialScores = {};
        response.data.forEach((m) => {
          initialScores[m._id] = {
            homeScore: m.homeScore ?? '',
            awayScore: m.awayScore ?? '',
          };
        });
        setScoreInputs(initialScores);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load matches' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowForm(true);
    setEditing(null);
    setFormData({
      homeTeam: '',
      awayTeam: '',
      homeLogo: '',
      awayLogo: '',
      matchTime: '',
      matchDate: new Date().toISOString().split('T')[0],
      league: '',
      leagueType: 'inter-quarter',
    });
  };

  const handleEdit = (match) => {
    setEditing(match._id);
    setShowForm(true);
    setFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeLogo: match.homeLogo,
      awayLogo: match.awayLogo,
      matchTime: match.matchTime,
      matchDate: new Date(match.matchDate).toISOString().split('T')[0],
      league: match.league,
      leagueType: match.leagueType || 'inter-quarter',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({});
    setUploading({ homeLogo: false, awayLogo: false });
  };

  const handleScoreChange = (id, field, value) => {
    setScoreInputs((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveScore = async (id) => {
    const inputs = scoreInputs[id] || {};
    const homeScore = Number(inputs.homeScore);
    const awayScore = Number(inputs.awayScore);
    if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
      setMessage({ type: 'error', text: 'Enter valid scores (numbers).' });
      return;
    }
    try {
      setSavingScore((prev) => ({ ...prev, [id]: true }));
      const response = await matchesAPI.updateScore(id, homeScore, awayScore);
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Score saved.' });
        fetchMatches();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to save score' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save score' });
    } finally {
      setSavingScore((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleImageUpload = async (e, logoType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ ...uploading, [logoType]: true });
    try {
      const response = await uploadAPI.uploadImage(file, 'matches');
      if (response.success) {
        setFormData({ ...formData, [logoType]: response.data.url });
        setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Image upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Image upload failed' });
    } finally {
      setUploading({ ...uploading, [logoType]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await matchesAPI.createMatch(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Match saved successfully!' });
        setShowForm(false);
        setEditing(null);
        setFormData({});
        fetchMatches();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save match' });
    }
  };

  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  return (
    <div className="matches-page">
      <div className="page-header">
        <h1>Inter-Quarter League</h1>
        <p>Create and manage inter-quarter football matches</p>
        <button className="btn-add" onClick={handleAdd}>
          <FaPlus /> Add New Match
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showForm && (
        <div className="match-form-card">
          <h3>{editing ? 'Edit Match' : 'Add New Match'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Home Team</label>
                <input
                  type="text"
                  value={formData.homeTeam}
                  onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Away Team</label>
                <input
                  type="text"
                  value={formData.awayTeam}
                  onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Home Team Logo</label>
                <input
                  type="text"
                  value={formData.homeLogo}
                  onChange={(e) => setFormData({ ...formData, homeLogo: e.target.value })}
                  placeholder="Logo URL or upload below"
                />
                <input
                  type="file"
                  ref={homeLogoInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e, 'homeLogo')}
                  accept="image/*"
                />
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => homeLogoInputRef.current?.click()}
                  disabled={uploading.homeLogo}
                >
                  {uploading.homeLogo ? <FaSpinner className="spinner" /> : <FaUpload />} Upload Logo
                </button>
                {formData.homeLogo && (
                  <img src={formData.homeLogo} alt="Home Logo Preview" className="logo-preview" />
                )}
              </div>
              <div className="form-group">
                <label>Away Team Logo</label>
                <input
                  type="text"
                  value={formData.awayLogo}
                  onChange={(e) => setFormData({ ...formData, awayLogo: e.target.value })}
                  placeholder="Logo URL or upload below"
                />
                <input
                  type="file"
                  ref={awayLogoInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e, 'awayLogo')}
                  accept="image/*"
                />
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => awayLogoInputRef.current?.click()}
                  disabled={uploading.awayLogo}
                >
                  {uploading.awayLogo ? <FaSpinner className="spinner" /> : <FaUpload />} Upload Logo
                </button>
                {formData.awayLogo && (
                  <img src={formData.awayLogo} alt="Away Logo Preview" className="logo-preview" />
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Match Time</label>
                <input
                  type="text"
                  value={formData.matchTime}
                  onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                  placeholder="4:00 PM"
                  required
                />
              </div>
              <div className="form-group">
                <label>Match Date</label>
                <input
                  type="date"
                  value={formData.matchDate}
                  onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>League</label>
                <input
                  type="text"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  placeholder="Premier League"
                  required
                />
              </div>
              <div className="form-group">
                <label>League Type</label>
                <select
                  value={formData.leagueType}
                  onChange={(e) => setFormData({ ...formData, leagueType: e.target.value })}
                  required
                >
                  <option value="inter-quarter">Inter-Quarter</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">
                <FaSave /> Save
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="matches-list">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match._id} className="match-card">
              <div className="match-header">
                <div className="match-teams">
                  <div className="team">
                    <img src={match.homeLogo || 'https://via.placeholder.com/40'} alt={match.homeTeam} />
                    <span>{match.homeTeam}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="team">
                    <span>{match.awayTeam}</span>
                    <img src={match.awayLogo || 'https://via.placeholder.com/40'} alt={match.awayTeam} />
                  </div>
                </div>
                <button className="btn-edit-small" onClick={() => handleEdit(match)}>
                  <FaEdit />
                </button>
              </div>
              <div className="match-details">
                <span className="detail-item">
                  <strong>League:</strong> {match.league || 'N/A'}
                </span>
                <span className="detail-item">
                  <strong>Type:</strong> {match.leagueType || 'inter-quarter'}
                </span>
                <span className="detail-item">
                  <strong>Time:</strong> {match.matchTime}
                </span>
                <span className="detail-item">
                  <strong>Date:</strong> {new Date(match.matchDate).toLocaleDateString()}
                </span>
                <span className="detail-item">
                  <strong>Status:</strong> {match.status || 'upcoming'}
                </span>
              </div>
              <div className="score-entry">
                <div className="score-inputs">
                  <label>Final Score</label>
                  <div className="score-fields">
                    <input
                      type="number"
                      value={(scoreInputs[match._id]?.homeScore ?? '').toString()}
                      onChange={(e) => handleScoreChange(match._id, 'homeScore', e.target.value)}
                      placeholder="Home"
                      min="0"
                    />
                    <span className="score-separator">-</span>
                    <input
                      type="number"
                      value={(scoreInputs[match._id]?.awayScore ?? '').toString()}
                      onChange={(e) => handleScoreChange(match._id, 'awayScore', e.target.value)}
                      placeholder="Away"
                      min="0"
                    />
                  </div>
                  <button
                    className="btn-save-score"
                    onClick={() => handleSaveScore(match._id)}
                    disabled={savingScore[match._id]}
                  >
                    {savingScore[match._id] ? <FaSpinner className="spinner" /> : <FaSave />} Save Final Score
                  </button>
                  {match.homeScore !== null && match.awayScore !== null && (
                    <div className="current-score">
                      Current: {match.homeScore} - {match.awayScore}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No matches found</div>
        )}
      </div>
    </div>
  );
};

export default InterQuarterLeague;
