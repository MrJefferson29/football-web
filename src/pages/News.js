import React, { useState, useEffect } from 'react';
import { FaNewspaper, FaPlus, FaTrash, FaEdit, FaUpload } from 'react-icons/fa';
import { newsAPI, uploadAPI } from '../utils/api';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    videoUrl: '',
    youtubeUrl: '',
    thumbnail: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getNews();
      if (response.success) {
        setNews(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load news' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await newsAPI.createNews(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'News created successfully!' });
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          category: 'other',
          videoUrl: '',
          youtubeUrl: '',
          thumbnail: '',
        });
        fetchNews();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create news' });
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
      const response = await uploadAPI.uploadImage(file, 'news');
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
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        await newsAPI.deleteNews(id);
        setMessage({ type: 'success', text: 'News deleted successfully!' });
        fetchNews();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete news' });
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading news...</div>;
  }

  return (
    <div className="news-page">
      <div className="page-header">
        <h1>Manage News</h1>
        <p>Create and manage news articles</p>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> {showForm ? 'Cancel' : 'Add News'}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Add New News</h3>
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
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="trending">Trending</option>
                <option value="breaking">Breaking</option>
                <option value="transfer">Transfer</option>
                <option value="match-report">Match Report</option>
                <option value="analysis">Analysis</option>
                <option value="other">Other</option>
              </select>
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
                <label>Video URL</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="Direct video URL"
                />
              </div>
              <div className="form-group">
                <label>YouTube URL</label>
                <input
                  type="text"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="YouTube URL"
                />
              </div>
            </div>
            <button type="submit" className="btn-save">Create News</button>
          </form>
        </div>
      )}

      <div className="news-grid">
        {news.length > 0 ? (
          news.map((item) => (
            <div key={item._id} className="news-card">
              {item.thumbnail && (
                <div className="news-thumbnail">
                  <img src={item.thumbnail} alt={item.title} />
                </div>
              )}
              <div className="news-content">
                <div className="news-header">
                  <h3>{item.title}</h3>
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDelete(item._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <p className="news-category">{item.category}</p>
                {item.isTrending && <span className="trending-badge">Trending</span>}
                {item.description && <p className="news-description">{item.description}</p>}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No news found</div>
        )}
      </div>
    </div>
  );
};

export default News;

