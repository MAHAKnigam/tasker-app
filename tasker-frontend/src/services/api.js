import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getAll: () => api.get('/users'),
};

// Task endpoints
export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getAll: (filters = {}) => api.get('/tasks', { params: filters }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
  getByStatus: (status) => api.get(`/tasks/status/${status}`),
  getByPriority: (priority) => api.get(`/tasks/priority/${priority}`),
};

// Team endpoints
export const teamAPI = {
  create: (data) => api.post('/teams', data),
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  join: (inviteCode) => api.post('/teams/join', { inviteCode }),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  regenerateCode: (teamId) => api.post(`/teams/${teamId}/regenerate-code`),
};

export default api;
