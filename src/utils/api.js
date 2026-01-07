import axios from 'axios';

const API_BASE_URL = 'https://football-n2tj.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Polls API
export const pollsAPI = {
  getPolls: async () => {
    const response = await api.get('/polls');
    return response.data;
  },
  getPollByType: async (type) => {
    const response = await api.get(`/polls/${type}`);
    return response.data;
  },
  createPoll: async (pollData) => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },
};

// Matches API
export const matchesAPI = {
  getMatches: async (params = {}) => {
    const response = await api.get('/matches', { params });
    return response.data;
  },
  getTodayMatches: async (params = {}) => {
    const response = await api.get('/matches/today', { params });
    return response.data;
  },
  createMatch: async (matchData) => {
    const response = await api.post('/matches', matchData);
    return response.data;
  },
  getMatch: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },
  updateScore: async (id, homeScore, awayScore) => {
    const response = await api.put(`/matches/${id}/score`, { homeScore, awayScore });
    return response.data;
  },
};

// Highlights API
export const highlightsAPI = {
  getHighlights: async () => {
    const response = await api.get('/highlights');
    return response.data;
  },
  createHighlight: async (highlightData) => {
    const response = await api.post('/highlights', highlightData);
    return response.data;
  },
  updateHighlight: async (id, highlightData) => {
    const response = await api.put(`/highlights/${id}`, highlightData);
    return response.data;
  },
  deleteHighlight: async (id) => {
    const response = await api.delete(`/highlights/${id}`);
    return response.data;
  },
};

// News API
export const newsAPI = {
  getNews: async () => {
    const response = await api.get('/news');
    return response.data;
  },
  createNews: async (newsData) => {
    const response = await api.post('/news', newsData);
    return response.data;
  },
  updateNews: async (id, newsData) => {
    const response = await api.put(`/news/${id}`, newsData);
    return response.data;
  },
  deleteNews: async (id) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },
};

// Live Matches API
export const liveMatchesAPI = {
  getLiveMatches: async () => {
    const response = await api.get('/live-matches');
    return response.data;
  },
  createLiveMatch: async (matchData) => {
    const response = await api.post('/live-matches', matchData);
    return response.data;
  },
  getLiveMatch: async (id) => {
    const response = await api.get(`/live-matches/${id}`);
    return response.data;
  },
};

// Fan Groups API
export const fanGroupsAPI = {
  getFanGroups: async () => {
    const response = await api.get('/fan-groups');
    return response.data;
  },
  createFanGroup: async (groupData) => {
    const response = await api.post('/fan-groups', groupData);
    return response.data;
  },
  createPost: async (groupId, postData) => {
    const response = await api.post(`/fan-groups/${groupId}/posts`, postData);
    return response.data;
  },
};

// Statistics API
export const statisticsAPI = {
  getStatistics: async () => {
    const response = await api.get('/statistics');
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file, folder = 'football-app') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default api;

