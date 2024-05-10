/* eslint-disable max-len */
const functions = require("firebase-functions");
const { sign } = require("jsonwebtoken");
const crypto = require("crypto");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const generateCoinbaseAuthToken = (path) => {
  const keyName = functions.config().coinbase.apikey;
  const keysecret = functions.config().coinbase.apisecret;
  const url = "api.coinbase.com";

  const algorithm = "ES256";
  const uri = "GET" + " " + url + path;
  const token = sign(
    {
      iss: "coinbase-cloud",
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: keyName,
      uri,
    },
    keysecret,
    {
      algorithm,
      header: {
        kid: keyName,
        nonce: crypto.randomBytes(16).toString("hex"),
      },
    },
  );

  return token;
};

//data key for candles is the timestamp
// exports.fetchProductCandlesFromFirebase = onRequest();

const storeProductCandlesInFirebase = async (candles, symbol) => {
  const productCandlesCollection = db.collection(symbol + "Candles");
  console.log(candles[0]);
  const batch = db.batch();
  const keys = ["Date", "Low", "High", "Open", "Close", "Volume"];

  candles.forEach((element) => {
    // Set the document ID to the timestamp value
    const docRef = productCandlesCollection.doc(String(element[0]));
    const elementAsObject = keys.reduce((obj, key, index) => {
      obj[key] = element[index];
      return obj;
    }, {});
    batch.set(docRef, element);
  });

  await batch.commit();
};

// Firebase Function to fetch Coinbase product candles
// `/api/v3/brokerage/products/${productId}/candles?start=${start}&end=${end}&granularity=${granularity}`;
exports.fetchProductCandlesFromCoinbase = onRequest(
  { cors: ["localhost:5123"] },
  async (req, res) => {
    // Extract the ID token from Authorization header or query params
    const idToken =
      req.headers.authorization.split("Bearer ")[1] || req.query.token;

    if (!idToken) {
      return res.status(401).send("Unauthorized");
    }
    https: try {
      // Verify the ID token
      // const decodedToken = await admin.auth().verifyIdToken(idToken);
      // const uid = decodedToken.uid; // You now have the user's UID if needed

      const { productId, start, end, granularity } = req.query;
      const path = `/products`;
      const jwt = generateCoinbaseAuthToken(path);
      const uri = `${path}/${productId}/candles?start=${start}&end=${end}&granularity=${granularity}`;

      const response = await axios.get(
        `https://api.exchange.coinbase.com${uri}`,
        {
          headers: { Authorization: "Bearer " + jwt },
        },
      );

      // Reference the collection and document where the data will be stored
      // const productDocRef = db.collection("productCandles").doc(productId);

      // Set the document data, or update if it exists
      // await productDocRef.set({ candles }, { merge: true });
      storeProductCandlesInFirebase(response.data, productId);

      res.send(response.data);
    } catch (error) {
      console.error(
        "Authentication error or Error fetching product candles:",
        error,
      );
      if (error.code === "auth/id-token-expired") {
        res.status(403).send("Session expired");
      } else {
        res.status(500).send("Internal Server Error");
      }
    }
  },
);

//alternate code to sign request. may be useful later.
const signRequestWIP = () => {
  // create the json request object
  var cb_access_timestamp = Date.now() / 1000; // in ms
  var cb_access_passphrase = "...";
  var secret = "PYPd1Hv4J6/7x...";
  var requestPath = "/orders";
  var body = JSON.stringify({
    price: "1.0",
    size: "1.0",
    side: "buy",
    product_id: "BTC-USD",
  });
  var method = "POST";

  // create the prehash string by concatenating required parts
  var message = cb_access_timestamp + method + requestPath + body;

  // decode the base64 secret
  var key = Buffer.from(secret, "base64");

  // create a sha256 hmac with the secret
  var hmac = crypto.createHmac("sha256", key);

  // sign the require message with the hmac and base64 encode the result
  var cb_access_sign = hmac.update(message).digest("base64");
};
