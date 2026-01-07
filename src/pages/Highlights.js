import React, { useState, useEffect } from 'react';
import { FaVideo, FaPlus, FaTrash, FaEdit, FaUpload, FaImage } from 'react-icons/fa';
import { highlightsAPI, uploadAPI } from '../utils/api';
import './Highlights.css';

const Highlights = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'highlights',
    youtubeUrl: '',
    thumbnail: '',
    duration: '',
    views: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await highlightsAPI.getHighlights();
      if (response.success) {
        setHighlights(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load highlights' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await highlightsAPI.createHighlight(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Highlight created successfully!' });
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          category: 'highlights',
          youtubeUrl: '',
          thumbnail: '',
          duration: '',
          views: '',
        });
        fetchHighlights();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create highlight' });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(file, 'highlights');
      if (response.success) {
        setFormData({ ...formData, thumbnail: response.data.url });
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this highlight?')) {
      try {
        await highlightsAPI.deleteHighlight(id);
        setMessage({ type: 'success', text: 'Highlight deleted successfully!' });
        fetchHighlights();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete highlight' });
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading highlights...</div>;
  }

  return (
    <div className="highlights-page">
      <div className="page-header">
        <h1>Manage Highlights</h1>
        <p>Upload and manage football highlights</p>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> {showForm ? 'Cancel' : 'Add Highlight'}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Add New Highlight</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="goals">Goals</option>
                  <option value="skills">Skills</option>
                  <option value="tactics">Tactics</option>
                  <option value="highlights">Highlights</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>YouTube URL *</label>
                <input
                  type="text"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  required
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
            <div className="form-group">
              <label>Thumbnail</label>
              <div className="upload-section">
                <div className="upload-input-group">
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="Image URL or upload image"
                  />
                  <label className="upload-btn">
                    <FaUpload />
                    {uploading ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {formData.thumbnail && (
                  <div className="image-preview">
                    <img src={formData.thumbnail} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="8:45"
                />
              </div>
              <div className="form-group">
                <label>Views</label>
                <input
                  type="text"
                  value={formData.views}
                  onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                  placeholder="2.1M views"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Views</label>
              <input
                type="text"
                value={formData.views}
                onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                placeholder="2.1M views"
              />
            </div>
            <button type="submit" className="btn-save">Create Highlight</button>
          </form>
        </div>
      )}

      <div className="highlights-grid">
        {highlights.length > 0 ? (
          highlights.map((highlight) => (
            <div key={highlight._id} className="highlight-card">
              <div className="highlight-thumbnail">
                <img
                  src={highlight.thumbnail || `https://img.youtube.com/vi/${highlight.youtubeUrl.split('v=')[1]}/maxresdefault.jpg`}
                  alt={highlight.title}
                />
                <div className="highlight-overlay">
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(highlight._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="highlight-content">
                <h3>{highlight.title}</h3>
                <p className="highlight-category">{highlight.category}</p>
                {highlight.duration && <span className="highlight-duration">{highlight.duration}</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No highlights found</div>
        )}
      </div>
    </div>
  );
};

export default Highlights;

