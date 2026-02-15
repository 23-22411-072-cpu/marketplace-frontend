import axios from 'axios';

const api = axios.create({
  baseURL: 'https://skillhub-backend-production.up.railway.app', 
  withCredentials: false, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
   
    const token = localStorage.getItem('auth_token'); 
    
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;
