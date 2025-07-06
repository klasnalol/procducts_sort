import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const createProduct = (formData) =>
  axios.post(`${API_URL}/product`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getQrCode = (id) => `${API_URL}/qr/${id}`;
export const scanProduct = (id) => axios.get(`${API_URL}/scan/${id}`);
export const sellProduct = (id, amount) => axios.post(`${API_URL}/sell/${id}`, { amount });
export const getProducts = (sort, order) => {
  const params = new URLSearchParams();
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  return axios.get(`${API_URL}/products?${params.toString()}`);
};