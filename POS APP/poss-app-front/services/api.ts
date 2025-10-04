// services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';  // Cambiar a localhost para mejor compatibilidad

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para debug
api.interceptors.request.use(request => {
  console.log('Request:', request.method?.toUpperCase(), request.url);
  console.log('WithCredentials:', request.withCredentials);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response SUCCESS:', response.status, response.config.url);
    return response;
  },
  (error: any) => {
    // Logging silencioso para desarrollo - solo mostramos errores importantes
    if (error.response?.status >= 500) {
      console.log('Server Error:', error.response.status, error.response.data);
    } else if (!error.response) {
      console.log('Connection Error: Cannot connect to Flask server');
    }
    
    return Promise.reject(error);
  }
);

export default api;