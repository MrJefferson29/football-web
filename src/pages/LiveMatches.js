import React, { useState, useEffect, useRef } from 'react';
import { FaTv, FaPlus, FaTrash, FaUpload, FaSpinner } from 'react-icons/fa';
import { liveMatchesAPI, uploadAPI } from '../utils/api';
import './LiveMatches.css';

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    homeTeam: '',
    awayTeam: '',
    homeLogo: '',
    awayLogo: '',
    youtubeUrl: '',
    thumbnail: '',
    matchDate: '',
    matchTime: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState({ thumbnail: false, homeLogo: false, awayLogo: false });
  const thumbnailInputRef = useRef(null);
  const homeLogoInputRef = useRef(null);
  const awayLogoInputRef = useRef(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await liveMatchesAPI.getLiveMatches();
      if (response.success) {
        setMatches(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load live matches' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ ...uploading, [type]: true });
    try {
      const response = await uploadAPI.uploadImage(file, 'live-matches');
      if (response.success) {
        setFormData({ ...formData, [type]: response.data.url });
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Image upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Image upload failed' });
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await liveMatchesAPI.createLiveMatch(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Live match created successfully!' });
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          homeTeam: '',
          awayTeam: '',
          homeLogo: '',
          awayLogo: '',
          youtubeUrl: '',
          thumbnail: '',
          matchDate: '',
          matchTime: '',
        });
        fetchMatches();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create live match' });
    }
  };

  if (loading) {
    return <div className="loading">Loading live matches...</div>;
  }

  return (
    <div className="live-matches-page">
      <div className="page-header">
        <h1>Manage Live Matches</h1>
        <p>Create and manage live streaming matches</p>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> {showForm ? 'Cancel' : 'Add Live Match'}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Add New Live Match</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Barcelona vs Real Madrid"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Home Team *</label>
                <input
                  type="text"
                  value={formData.homeTeam}
                  onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Away Team *</label>
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
                <label>Home Logo</label>
                <div className="image-upload-section">
                  <input
                    ref={homeLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'homeLogo')}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => homeLogoInputRef.current?.click()}
                    disabled={uploading.homeLogo}
                  >
                    {uploading.homeLogo ? (
                      <>
                        <FaSpinner className="spinner" /> Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload /> {formData.homeLogo ? 'Change Logo' : 'Upload Home Logo'}
                      </>
                    )}
                  </button>
                  {formData.homeLogo && (
                    <div className="image-preview">
                      <img src={formData.homeLogo} alt="Home logo preview" />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => setFormData({ ...formData, homeLogo: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Away Logo</label>
                <div className="image-upload-section">
                  <input
                    ref={awayLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'awayLogo')}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => awayLogoInputRef.current?.click()}
                    disabled={uploading.awayLogo}
                  >
                    {uploading.awayLogo ? (
                      <>
                        <FaSpinner className="spinner" /> Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload /> {formData.awayLogo ? 'Change Logo' : 'Upload Away Logo'}
                      </>
                    )}
                  </button>
                  {formData.awayLogo && (
                    <div className="image-preview">
                      <img src={formData.awayLogo} alt="Away logo preview" />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => setFormData({ ...formData, awayLogo: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>YouTube URL *</label>
                <input
                  type="text"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="form-group">
                <label>Thumbnail</label>
                <div className="image-upload-section">
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'thumbnail')}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={uploading.thumbnail}
                  >
                    {uploading.thumbnail ? (
                      <>
                        <FaSpinner className="spinner" /> Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload /> {formData.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                      </>
                    )}
                  </button>
                  {formData.thumbnail && (
                    <div className="image-preview">
                      <img src={formData.thumbnail} alt="Thumbnail preview" />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => setFormData({ ...formData, thumbnail: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Match Date *</label>
                <input
                  type="date"
                  value={formData.matchDate}
                  onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Match Time *</label>
                <input
                  type="time"
                  value={formData.matchTime}
                  onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-save">Create Live Match</button>
          </form>
        </div>
      )}

      <div className="live-matches-grid">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match._id} className="live-match-card">
              <div className="live-match-header">
                <div className="live-badge">LIVE</div>
                <h3>{match.title}</h3>
              </div>
              <div className="live-match-teams">
                <div className="team">
                  <img src={match.homeLogo || 'https://via.placeholder.com/50'} alt={match.homeTeam} />
                  <span>{match.homeTeam}</span>
                </div>
                <span className="vs">VS</span>
                <div className="team">
                  <span>{match.awayTeam}</span>
                  <img src={match.awayLogo || 'https://via.placeholder.com/50'} alt={match.awayTeam} />
                </div>
              </div>
              {match.description && <p className="live-match-description">{match.description}</p>}
            </div>
          ))
        ) : (
          <div className="empty-state">No live matches found</div>
        )}
      </div>
    </div>
  );
};

export default LiveMatches;

