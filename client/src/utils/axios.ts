import axios from 'axios';
import { config } from '../config/env.config';
import { getToken } from './auth';

const api = axios.create({
  baseURL: config.serverApiUrl
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 