import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const createProduct = (data) => axios.post(`${API_URL}/product`, data);
export const getQrCode = (id) => `${API_URL}/qr/${id}`;
export const scanProduct = (id) => axios.get(`${API_URL}/scan/${id}`);
export const sellProduct = (id, amount) => axios.post(`${API_URL}/sell/${id}`, { amount });
