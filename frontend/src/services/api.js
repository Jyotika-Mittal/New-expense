import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('🌐 API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const expenseAPI = {
  getAll: (params) => API.get('/expenses', { params }),
  add: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  detectCategory: (title) => API.post('/expenses/detect-category', { title }),
};

export const goalAPI = {
  getAll: () => API.get('/goals'),
  create: (data) => API.post('/goals', data),
  update: (id, data) => API.put(`/goals/${id}`, data),
  addSavings: (id, amount) => API.post(`/goals/${id}/savings`, { amount }),
  delete: (id) => API.delete(`/goals/${id}`),
};

export const insightsAPI = {
  getMonthly: (params) => API.get('/insights/monthly', { params }),
};

export const categoriesAPI = {
  getAll: () => API.get('/categories'),
};

export default API;
