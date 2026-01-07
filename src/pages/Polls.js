import React, { useState, useEffect, useRef } from 'react';
import { FaPoll, FaEdit, FaSave, FaTimes, FaUpload, FaSpinner } from 'react-icons/fa';
import { pollsAPI, uploadAPI } from '../utils/api';
import './Polls.css';

const Polls = () => {
  const [polls, setPolls] = useState({
    dailyPoll: null,
    clubBattle: null,
    goatCompetition: null,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState({ option1: false, option2: false });
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const [daily, club, goat] = await Promise.all([
        pollsAPI.getPollByType('daily-poll').catch(() => ({ data: null })),
        pollsAPI.getPollByType('club-battle').catch(() => ({ data: null })),
        pollsAPI.getPollByType('goat-competition').catch(() => ({ data: null })),
      ]);

      setPolls({
        dailyPoll: daily.data || null,
        clubBattle: club.data || null,
        goatCompetition: goat.data || null,
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load polls' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type, poll) => {
    setEditing(type);
    setFormData({
      question: poll?.question || '',
      option1Name: poll?.option1?.name || '',
      option1Image: poll?.option1?.image || '',
      option2Name: poll?.option2?.name || '',
      option2Image: poll?.option2?.image || '',
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({});
    setUploading({ option1: false, option2: false });
  };

  const handleImageUpload = async (e, option) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ ...uploading, [option]: true });
    try {
      const response = await uploadAPI.uploadImage(file, 'polls');
      if (response.success) {
        const imageKey = option === 'option1' ? 'option1Image' : 'option2Image';
        setFormData({ ...formData, [imageKey]: response.data.url });
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Image upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Image upload failed' });
    } finally {
      setUploading({ ...uploading, [option]: false });
    }
  };

  const handleSubmit = async (type) => {
    try {
      const pollData = {
        type,
        question: formData.question,
        option1: {
          name: formData.option1Name,
          image: formData.option1Image,
        },
        option2: {
          name: formData.option2Name,
          image: formData.option2Image,
        },
      };

      const response = await pollsAPI.createPoll(pollData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Poll updated successfully!' });
        setEditing(null);
        setFormData({});
        fetchPolls();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update poll' });
    }
  };

  const PollCard = ({ title, type, poll, icon: Icon }) => (
    <div className="poll-card">
      <div className="poll-card-header">
        <Icon className="poll-icon" />
        <h3>{title}</h3>
      </div>

      {editing === type ? (
        <div className="poll-form">
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter poll question"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Option 1 Name</label>
              <input
                type="text"
                value={formData.option1Name}
                onChange={(e) => setFormData({ ...formData, option1Name: e.target.value })}
                placeholder="Option 1"
              />
            </div>
            <div className="form-group">
              <label>Option 1 Image</label>
              <input
                type="text"
                value={formData.option1Image}
                onChange={(e) => setFormData({ ...formData, option1Image: e.target.value })}
                placeholder="Image URL or upload below"
              />
              <input
                type="file"
                ref={fileInputRef1}
                style={{ display: 'none' }}
                onChange={(e) => handleImageUpload(e, 'option1')}
                accept="image/*"
              />
              <button
                type="button"
                className="btn-upload"
                onClick={() => fileInputRef1.current?.click()}
                disabled={uploading.option1}
              >
                {uploading.option1 ? <FaSpinner className="spinner" /> : <FaUpload />} Upload Image
              </button>
              {formData.option1Image && (
                <img src={formData.option1Image} alt="Option 1 Preview" className="image-preview" />
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Option 2 Name</label>
              <input
                type="text"
                value={formData.option2Name}
                onChange={(e) => setFormData({ ...formData, option2Name: e.target.value })}
                placeholder="Option 2"
              />
            </div>
            <div className="form-group">
              <label>Option 2 Image</label>
              <input
                type="text"
                value={formData.option2Image}
                onChange={(e) => setFormData({ ...formData, option2Image: e.target.value })}
                placeholder="Image URL or upload below"
              />
              <input
                type="file"
                ref={fileInputRef2}
                style={{ display: 'none' }}
                onChange={(e) => handleImageUpload(e, 'option2')}
                accept="image/*"
              />
              <button
                type="button"
                className="btn-upload"
                onClick={() => fileInputRef2.current?.click()}
                disabled={uploading.option2}
              >
                {uploading.option2 ? <FaSpinner className="spinner" /> : <FaUpload />} Upload Image
              </button>
              {formData.option2Image && (
                <img src={formData.option2Image} alt="Option 2 Preview" className="image-preview" />
              )}
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={() => handleSubmit(type)}>
              <FaSave /> Save
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {poll ? (
            <div className="poll-info">
              <p className="poll-question">{poll.question}</p>
              <div className="poll-options">
                <div className="poll-option">
                  <img src={poll.option1.image || 'https://via.placeholder.com/100'} alt={poll.option1.name} />
                  <span>{poll.option1.name}</span>
                  <span className="poll-votes">{poll.option1.votes} votes</span>
                </div>
                <div className="poll-option">
                  <img src={poll.option2.image || 'https://via.placeholder.com/100'} alt={poll.option2.name} />
                  <span>{poll.option2.name}</span>
                  <span className="poll-votes">{poll.option2.votes} votes</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="no-poll">No poll created yet</p>
          )}
          <button className="btn-edit" onClick={() => handleEdit(type, poll)}>
            <FaEdit /> {poll ? 'Edit' : 'Create'} Poll
          </button>
        </>
      )}
    </div>
  );

  if (loading) {
    return <div className="loading">Loading polls...</div>;
  }

  return (
    <div className="polls-page">
      <div className="page-header">
        <h1>Manage Polls</h1>
        <p>Create and edit polls for users to vote on</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="polls-grid">
        <PollCard
          title="Daily Poll"
          type="daily-poll"
          poll={polls.dailyPoll}
          icon={FaPoll}
        />
        <PollCard
          title="Club Battle"
          type="club-battle"
          poll={polls.clubBattle}
          icon={FaPoll}
        />
        <PollCard
          title="Goat Competition"
          type="goat-competition"
          poll={polls.goatCompetition}
          icon={FaPoll}
        />
      </div>
    </div>
  );
};

export default Polls;

