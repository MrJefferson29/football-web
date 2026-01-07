import React, { useState, useEffect, useRef } from 'react';
import { FaUsers, FaPlus, FaEdit, FaUpload, FaSpinner } from 'react-icons/fa';
import { fanGroupsAPI, uploadAPI } from '../utils/api';
import './FanGroups.css';

const FanGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(null);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    slogan: '',
    logo: '',
    color: '#FFFFFF',
  });
  const [postFormData, setPostFormData] = useState({
    content: '',
    image: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const logoInputRef = useRef(null);
  const postImageInputRef = useRef(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fanGroupsAPI.getFanGroups();
      if (response.success) {
        setGroups(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load fan groups' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'fan-groups');
      if (response.success) {
        setGroupFormData({ ...groupFormData, logo: response.data.url });
        setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Logo upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Logo upload failed' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePostImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPostImage(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'fan-groups/posts');
      if (response.success) {
        setPostFormData({ ...postFormData, image: response.data.url });
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Image upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Image upload failed' });
    } finally {
      setUploadingPostImage(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fanGroupsAPI.createFanGroup(groupFormData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Fan group created successfully!' });
        setShowGroupForm(false);
        setGroupFormData({ name: '', slogan: '', logo: '', color: '#FFFFFF' });
        fetchGroups();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create fan group' });
    }
  };

  const handleCreatePost = async (groupId, e) => {
    e.preventDefault();
    try {
      const response = await fanGroupsAPI.createPost(groupId, postFormData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Post created successfully!' });
        setShowPostForm(null);
        setPostFormData({ content: '', image: '' });
        fetchGroups();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create post' });
    }
  };

  if (loading) {
    return <div className="loading">Loading fan groups...</div>;
  }

  return (
    <div className="fan-groups-page">
      <div className="page-header">
        <h1>Manage Fan Groups</h1>
        <p>Create fan groups and manage posts</p>
        <button className="btn-add" onClick={() => setShowGroupForm(!showGroupForm)}>
          <FaPlus /> {showGroupForm ? 'Cancel' : 'Create Group'}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showGroupForm && (
        <div className="form-card">
          <h3>Create Fan Group</h3>
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label>Group Name *</label>
              <input
                type="text"
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Slogan</label>
              <input
                type="text"
                value={groupFormData.slogan}
                onChange={(e) => setGroupFormData({ ...groupFormData, slogan: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Logo</label>
                <div className="image-upload-section">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <>
                        <FaSpinner className="spinner" /> Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload /> {groupFormData.logo ? 'Change Logo' : 'Upload Logo'}
                      </>
                    )}
                  </button>
                  {groupFormData.logo && (
                    <div className="image-preview">
                      <img src={groupFormData.logo} alt="Logo preview" />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => setGroupFormData({ ...groupFormData, logo: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={groupFormData.color}
                  onChange={(e) => setGroupFormData({ ...groupFormData, color: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-save">Create Group</button>
          </form>
        </div>
      )}

      <div className="fan-groups-grid">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group._id} className="fan-group-card">
              <div className="group-header">
                <img src={group.logo || 'https://via.placeholder.com/60'} alt={group.name} className="group-logo" />
                <div className="group-info">
                  <h3>{group.name}</h3>
                  <p className="group-slogan">{group.slogan}</p>
                  <p className="group-members">{group.memberCount || 0} members</p>
                </div>
              </div>
              <div className="group-posts">
                <div className="posts-header">
                  <h4>Posts ({group.posts?.length || 0})</h4>
                  <button
                    className="btn-add-post"
                    onClick={() => setShowPostForm(showPostForm === group._id ? null : group._id)}
                  >
                    <FaPlus /> Add Post
                  </button>
                </div>
                {showPostForm === group._id && (
                  <form
                    className="post-form"
                    onSubmit={(e) => handleCreatePost(group._id, e)}
                  >
                    <textarea
                      value={postFormData.content}
                      onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                      placeholder="Write a post..."
                      required
                      rows="3"
                    />
                    <div className="image-upload-section">
                      <input
                        ref={postImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePostImageUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => postImageInputRef.current?.click()}
                        disabled={uploadingPostImage}
                      >
                        {uploadingPostImage ? (
                          <>
                            <FaSpinner className="spinner" /> Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload /> {postFormData.image ? 'Change Image' : 'Upload Image (optional)'}
                          </>
                        )}
                      </button>
                      {postFormData.image && (
                        <div className="image-preview">
                          <img src={postFormData.image} alt="Post preview" />
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => setPostFormData({ ...postFormData, image: '' })}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-save-small">Post</button>
                      <button
                        type="button"
                        className="btn-cancel-small"
                        onClick={() => setShowPostForm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <div className="posts-list">
                  {group.posts && group.posts.length > 0 ? (
                    group.posts.slice(0, 3).map((post, idx) => (
                      <div key={idx} className="post-item">
                        <p>{post.content}</p>
                        {post.image && <img src={post.image} alt="Post" className="post-image" />}
                        <div className="post-stats">
                          <span>👍 {post.likes || 0}</span>
                          <span>💬 {post.comments?.length || 0}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-posts">No posts yet</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No fan groups found</div>
        )}
      </div>
    </div>
  );
};

export default FanGroups;

