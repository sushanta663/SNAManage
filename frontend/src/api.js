import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5100/api' });

// send the login token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export default api;
