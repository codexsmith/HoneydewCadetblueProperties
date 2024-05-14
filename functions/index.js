/* eslint-disable max-len */
const functions = require("firebase-functions");
const { sign } = require("jsonwebtoken");
const crypto = require("crypto");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const { collection } = require("firebase/firestore");

var serviceAccount = require("./projectrlive-dev-firebase-adminsdk-9payn-164871da63.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projectrlive-dev-default-rtdb.firebaseio.com",
});
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

const { Pool } = require("pg");
const pool = new Pool({
  //TODO env these
  user: "postgres",
  host: "localhost",
  database: "projectr_local",
  password: "Dream_319!",
  port: 5432,
});

const storeProductCandlesInPostgres = async (candles, symbol) => {
  const tableName = symbol.toLowerCase().replace("-", "") + "candles"; // ensure table name is appropriately formatted
  console.log(tableName);
  const keys = ["date", "low", "high", "open", "close", "volume"];
  const values = candles.map((element) =>
    keys.map((_, index) => element[index]),
  );

  const queryText = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES 
    ${values
      .map((value) => `(${value.map((v) => `'${v}'`).join(", ")})`)
      .join(", ")} ON CONFLICT (date) DO NOTHING`;

  try {
    const res = await pool.query(queryText);
    console.log("Insert successful:", res.rowCount);
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
};
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
    batch.set(docRef, elementAsObject);
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
      // storeProductCandlesInFirebase(response.data, productId);
      storeProductCandlesInPostgres(response.data, productId);

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

const scaffoldFirebase = async () => {
  try {
    //platform data
    //TODO
    const boardcolumncardmapping = collection(db, "boardcolumncardmapping");
    // let bccmTemplate = { boardRef : };
    const boards = collection(db, "boards");
    const cards = collection(db, "cards");
    const columns = collection(db, "columns");
    const tags = collection(db, "tags");
    const userboardmappings = collection(db, "userboardmappings");
    const users = collection(db, "users");

    //stock data
    const shibcandles = collection(db, "shibcandles");
    const symbolTemplate = "SHIB-USD";
    let candleTemplate = { symbol: symbolTemplate };
  } catch (error) {
    console.error(error);
  }
};

async function inferSchema() {
  try {
    // Retrieve all collections
    const collections = await db.listCollections();

    for (const collection of collections) {
      const collectionName = collection.id;
      const snapshot = await collection.limit(10).get();
      const schemas = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        Object.keys(data).forEach((key) => {
          if (!schemas[key]) {
            schemas[key] = typeof data[key];
          }
        });
      });

      console.log(`Inferred schema for collection ${collectionName}:`);
      console.log(schemas);
    }
  } catch (error) {
    console.error("Error inferring schema:", error);
  }
}
