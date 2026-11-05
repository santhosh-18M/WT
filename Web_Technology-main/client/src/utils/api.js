import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: apiBaseUrl
});

export const getToken = () => localStorage.getItem('roadDamageToken');

export const saveAuthData = (token, user) => {
  localStorage.setItem('roadDamageToken', token);
  localStorage.setItem('roadDamageUser', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('roadDamageToken');
  localStorage.removeItem('roadDamageUser');
};

export const getStoredUser = () => {
  const storedUser = localStorage.getItem('roadDamageUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export default apiClient;
