import React, { useEffect, useState } from "react";

const CoinbaseWebSocket = () => {
  const [price, setPrice] = useState("Loading...");

  useEffect(() => {
    const ws = new WebSocket("wss://ws-feed.pro.coinbase.com");

    ws.onopen = () => {
      console.log("WebSocket Connected");
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channels: [{ name: "ticker", product_ids: ["SHIB-USD"] }],
        })
      );
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);

      // Filtering the messages based on the type; updating price when a ticker message is received
      if (response.type === "ticker") {
        setPrice(response.price);
      }
    };

    ws.onerror = (error) => {
      console.log("WebSocket Error: ", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return <div>Current SHIB Price: ${price}</div>;
};

export default CoinbaseWebSocket;
