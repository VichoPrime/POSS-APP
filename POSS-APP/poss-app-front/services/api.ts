// services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';  // Cambiar a localhost para mejor compatibilidad

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // Aumentamos el timeout a 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para debug de requests
api.interceptors.request.use(request => {
  console.log('Request:', request.method?.toUpperCase(), request.url);
  console.log('Request Data:', request.params || request.data);
  return request;
});

// Interceptor para debug de respuestas
api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

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