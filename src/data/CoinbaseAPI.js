import axios from "axios";
import CryptoJS from "crypto-js";

// Function to generate the necessary headers for authenticated requests
export const generateAuthHeaders = (method, path, body = "") => {
  const timestamp = Math.floor(Date.now() / 1000); // Timestamp in seconds
  const message = timestamp + method.toUpperCase() + path + body;
  const signature = CryptoJS.HmacSHA256(message, API_SECRET).toString(
    CryptoJS.enc.Hex,
  );

  return {
    "CB-ACCESS-KEY": API_KEY,
    "CB-ACCESS-SIGN": signature,
    "CB-ACCESS-TIMESTAMP": timestamp,
  };
};

const BASE_URL = "https://api.coinbase.com/v3/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Function to set the Authorization header on the axios instance
const setAuthToken = (token) => {
  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const fetchAccount = async () => {
  const method = "GET";
  const path = "/accounts";
  const headers = generateAuthHeaders(method, path);

  try {
    const response = await axiosInstance.get(path, { headers });
    return response.data;
  } catch (error) {
    console.error("Error with fetchAccount:", error);
    throw error;
  }
};

export const getProductCandles = async (productId, params) => {
  const method = "GET";
  const path = "/brokerage";
  const headers = generateAuthHeaders(method, path);

  try {
    const response = await axiosInstance.get(
      `/brokerage/products/${productId}/candles`,
      {
        params,
      },
      { headers },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product candles:", error);
    throw error; // Rethrowing the error is useful if you want calling components to handle it
  }
};

//===================================================================
// Example use
// import React, { useEffect } from 'react';
// import { getProductCandles, setAuthToken } from './CoinbaseService';

// const MyComponent = () => {
//   useEffect(() => {
//     const fetchData = async () => {
//       setAuthToken('your_auth_token_here'); // Set this at a higher/appropriate level instead if possible
//       try {
//         const data = await getProductCandles('BTC-USD', {
//           // Example params
//           granularity: 86400, // Daily candles
//         });
//         console.log(data);
//       } catch (error) {
//         console.error('Failed to fetch product candles:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       {/* Render your component UI here */}
//     </div>
//   );
// };

// export default MyComponent;
