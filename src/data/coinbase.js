import axios from 'axios';

const BASE_URL = 'https://api.coinbase.com/v3/';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // Additional headers can be configured here, such as Content-Type
});

// Function to set the Authorization header on the axios instance
const setAuthToken = (token) => {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};



export const getProductCandles = async (productId, params) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}/candles`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching product candles:', error);
    throw error; // Rethrowing the error is useful if you want calling components to handle it
  }
};

