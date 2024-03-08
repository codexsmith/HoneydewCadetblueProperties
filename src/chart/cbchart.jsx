import React, { useEffect, useState } from "react";

const CoinbaseWebSocket = () => {
  const [price, setPrice] = useState("Loading...");
  
  organizations/b488b7aa-93c6-466d-af85-586663a5de16/apiKeys/b5fa3448-e022-400f-9d66-e11b5ac94d02
-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIAr7UDhGf7KeEluNCTarvegurntD24795roZMQR6Tkh2oAoGCCqGSM49\nAwEHoUQDQgAE2pBYtHmVNxMZpgrOIxD9YB1Blf1T/SIGiS/2PCKeDemifWtmVge0\nGuCCAD+UU+06jf++SbnYPpSl0ZsvXGNzuw==\n-----END EC PRIVATE KEY-----\n
  
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
