/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const CryptoJS = require("crypto-js");

// Coinbase API information (ensure these are securely stored, e.g., in environment config)
const API_KEY = functions.config().coinbase.api_key;
const API_SECRET = functions.config().coinbase.api_secret;


admin.initializeApp();

// Function to generate the necessary headers for authenticated requests
const generateAuthHeaders = (method, path, body = "") => {
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

// Firebase Function to fetch Coinbase product candles
exports.fetchProductCandles = functions.https.onRequest(async (req, res) => {
    // Extract the ID token from Authorization header or query params
    const idToken = req.headers.authorization?.split('Bearer ')[1] || req.query.token;
  
    if (!idToken) {
      return res.status(403).send('Unauthorized');
    }
  
    try {
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid; // You now have the user's UID if needed
  
      // The rest of your function logic here
      const { productId, start, end, granularity } = req.query;
      const method = 'GET';
      const path = `/v3/brokerage/products/${productId}/candles?start=${start}&end=${end}&granularity=${granularity}`;
      const headers = generateAuthHeaders(method, path);
  
      const response = await axios.get(`https://api.coinbase.com${path}`, { headers });
      res.send(response.data);
  
    } catch (error) {
      console.error("Authentication error or Error fetching product candles:", error);
      if (error.code === 'auth/id-token-expired') {
        res.status(403).send('Session expired');
      } else {
        res.status(500).send('Internal Server Error');
      }
    }
  });