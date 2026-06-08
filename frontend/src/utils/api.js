// src/api/axiosClient.js
import axios from 'axios';

// Create pre-configured instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL for all endpoints
  timeout: 5000,                         // Abort request if it takes longer than 5s
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default apiClient;

// Add a request interceptor to automatically attach JWT Auth Tokens
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`; // Injects JWT token
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Add a response interceptor to handle global errors (like 401 Unauthorized)
// api.interceptors.response.use(
//   (response) => response, 
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Logic to redirect to login or clear bad state
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );
