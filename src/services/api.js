import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Dynamic Token Extraction
api.interceptors.request.use(
  (config) => {
    let token;

    if (typeof window !== 'undefined') {
      // Client-side environment
      token = Cookies.get('token');
    } else {
      // Server-side environment (SSR/Server Actions)
      const { cookies } = require('next/headers');
      token = cookies().get('token')?.value;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'A network error occurred';
    const status = error.response?.status;
    const resData = error.response?.data;

    // Auto-logout on 401 Unauthorized (except for login/register)
    if (status === 401 && !error.config.url.includes('/auth/')) {
      console.error('Session expired or unauthorized');
    }

    // Handle 403 suspension mid-session (except on login/register routes)
    if (status === 403 && resData?.suspensionDetails && !error.config.url.includes('/auth/')) {
      if (typeof window !== 'undefined') {
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('user');
        // Redirect to login with a suspension indicator
        window.location.href = '/login?suspended=true';
      }
    }

    return Promise.reject(error);
  }
);

export default api;