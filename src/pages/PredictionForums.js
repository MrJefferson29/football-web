import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaUser, FaSpinner } from 'react-icons/fa';
import { predictionForumsAPI, uploadAPI } from '../utils/api';
import './PredictionForums.css';

const PredictionForums = () => {
  const [forums, setForums] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showForumForm, setShowForumForm] = useState(false);
  const [forumFormData, setForumFormData] = useState({
    name: '',
    description: '',
    headUserId: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const profileInputRef = React.useRef(null);

  useEffect(() => {
    fetchForums();
    fetchUsers();
  }, []);

  const fetchForums = async () => {
    try {
      setLoading(true);
      const response = await predictionForumsAPI.getPredictionForums();
      if (response.success) {
        setForums(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load prediction forums' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await predictionForumsAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'prediction-forums');
      if (response.success) {
        setForumFormData({ ...forumFormData, profilePicture: response.data.url });
        setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Profile upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Profile upload failed' });
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCreateForum = async (e) => {
    e.preventDefault();
    if (!forumFormData.name || !forumFormData.headUserId) {
      setMessage({ type: 'error', text: 'Please provide forum name and select a head user' });
      return;
    }

    try {
      const response = await predictionForumsAPI.createPredictionForum(forumFormData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Prediction forum created successfully!' });
        setShowForumForm(false);
        setForumFormData({ name: '', description: '', headUserId: '' });
        fetchForums();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create prediction forum' 
      });
    }
  };

  const handleDeleteForum = async (forumId) => {
    if (!window.confirm('Are you sure you want to deactivate this forum?')) {
      return;
    }

    try {
      const response = await predictionForumsAPI.deletePredictionForum(forumId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Forum deactivated successfully!' });
        fetchForums();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete forum' });
    }
  };

  return (
    <div className="prediction-forums">
      <div className="page-header">
        <h1>Prediction Forums</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForumForm(!showForumForm)}
        >
          <FaPlus /> Create Forum
        </button>
      </div>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {showForumForm && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Create Prediction Forum</h2>
            <form onSubmit={handleCreateForum}>
              <div className="form-group">
                <label>Forum Name *</label>
                <input
                  type="text"
                  value={forumFormData.name}
                  onChange={(e) => setForumFormData({ ...forumFormData, name: e.target.value })}
                  required
                  placeholder="Enter forum name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={forumFormData.description}
                  onChange={(e) => setForumFormData({ ...forumFormData, description: e.target.value })}
                  placeholder="Enter forum description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Select Forum Head *</label>
                {usersLoading ? (
                  <div className="loading-spinner">
                    <FaSpinner className="spinner" /> Loading users...
                  </div>
                ) : (
                  <select
                    value={forumFormData.headUserId}
                    onChange={(e) => setForumFormData({ ...forumFormData, headUserId: e.target.value })}
                    required
                  >
                    <option value="">Select a user...</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Forum
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForumForm(false);
                    setForumFormData({ name: '', description: '', headUserId: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading prediction forums...</p>
        </div>
      ) : forums.length === 0 ? (
        <div className="empty-state">
          <FaUsers size={64} />
          <h3>No Prediction Forums</h3>
          <p>Create your first prediction forum to get started</p>
        </div>
      ) : (
        <div className="forums-grid">
          {forums.map((forum) => (
            <div key={forum._id} className="forum-card">
              <div className="forum-header">
                {forum.profilePicture ? (
                  <img src={forum.profilePicture} alt={forum.name} className="forum-image" />
                ) : (
                  <div className="forum-icon">
                    <FaUsers />
                  </div>
                )}
                <div className="forum-info">
                  <h3>{forum.name}</h3>
                  <p className="forum-description">{forum.description || 'No description'}</p>
                </div>
              </div>
              
              <div className="forum-details">
                <div className="detail-item">
                  <FaUsers />
                  <span>{forum.memberCount || 0} members</span>
                </div>
                {forum.headUserId && (
                  <div className="detail-item">
                    <FaUser />
                    <span>Head: {forum.headUserId.username}</span>
                  </div>
                )}
              </div>

              <div className="forum-actions">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteForum(forum._id)}
                >
                  <FaTrash /> Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictionForums;
