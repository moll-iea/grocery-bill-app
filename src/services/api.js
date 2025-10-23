import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const { access_token } = response.data;
        localStorage.setItem('accessToken', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const refreshAccessToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

// Bill APIs
export const calculateBill = async (items, discount = 0) => {
  try {
    const response = await api.post('/bills/calculate', { items, discount });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createBill = async (userId, items, discount = 0) => {
  try {
    const response = await api.post('/bills/', { 
      user_id: userId, 
      items, 
      discount 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getBill = async (billId) => {
  try {
    const response = await api.get(`/bills/${billId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserBills = async (userId) => {
  try {
    const response = await api.get(`/bills/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteBill = async (billId) => {
  try {
    const response = await api.delete(`/bills/${billId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Analytics APIs
export const getAnalytics = async (userId) => {
  try {
    const response = await api.get(`/bills/analytics/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPriceTrends = async (itemName) => {
  try {
    const response = await api.get(`/bills/price-trends/${itemName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateShoppingList = async (userId, daysBack = 30) => {
  try {
    const response = await api.get(`/bills/shopping-list/${userId}?days=${daysBack}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const parseReceipt = async (receiptText) => {
  try {
    const response = await api.post('/bills/parse-receipt', { text: receiptText });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getBestDeals = async (userId) => {
  try {
    const response = await api.get(`/bills/best-deals/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;