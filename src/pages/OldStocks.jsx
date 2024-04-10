import React, { useEffect, useState, useCallback } from "react";
import BoardContainer from "../kanban/BoardContainer";
import { useUser } from "reactfire";
import { SignIn } from "../components/SignIn";
import StockChart from "../chart/stockChart";
import { Box } from "@chakra-ui/react";
import AmChart from "../chart/amchart";
import IsChart from "../chart/ischart";
import CoinbaseWebSocket from "../chart/cbchart";
import { fetch_twelvedata_url } from "../data/TwelveDataAPI";

function calculate_start(interval) {
  let start_date = new Date();
  let scalemultiplier = 2;
  switch (interval) {
    case "1min":
      start_date.setMinutes(start_date.getMinutes() - 1 * scalemultiplier);
      return start_date;
      break;

    case "3min":
      start_date.setMinutes(start_date.getMinutes() - 3 * scalemultiplier);
      return start_date;
      break;

    case "5min":
      start_date.setMinutes(start_date.getMinutes() - 5 * scalemultiplier);
      return start_date;
      break;

    case "15min":
      start_date.setMinutes(start_date.getMinutes() - 15 * scalemultiplier);

      return start_date;
      break;

    case "30min":
      start_date.setMinutes(start_date.getMinutes() - 30 * scalemultiplier);

      return start_date;
      break;

    case "45min":
      start_date.setMinutes(start_date.getMinutes() - 45 * scalemultiplier);

      return start_date;
      break;

    case "1h":
      start_date.setHours(start_date.getHours() - 1 * scalemultiplier);
      return start_date;
      break;

    case "2h":
      start_date.setHours(start_date.getHours() - 2 * scalemultiplier);
      return start_date;
      break;

    case "3h":
      start_date.setHours(start_date.getHours() - 3 * scalemultiplier);
      return start_date;
      break;

    case "4h":
      start_date.setHours(start_date.getHours() - 4 * scalemultiplier);
      return start_date;
      break;
    case "1day":
      start_date.setDate(start_date.getDate() - 1 * scalemultiplier);
      return start_date;
      break;
    case "1week":
      start_date.setDate(start_date.getDate() - 7 * scalemultiplier);
      return start_date;
      break;
    case "1month":
      start_date.setDate(start_date.getMonth() - 1 * scalemultiplier);
      return start_date;
      break;
  }
}

function buildURLs(intervals) {
  return intervals.map((interval) => {
    const start = calculate_start(interval);
    const altstart = new Date();
    altstart.setHours(start.getHours() - 1);

    const end = new Date();

    const symbol = "SHIB/USD";

    return {
      interval: interval,
      poll: 60000,
      //symbol, interval, startDate, endDate, requestedData;
      rsi: fetch_twelvedata_url(symbol, interval, start, end, "rsi"),
      macd: fetch_twelvedata_url(symbol, interval, altstart, end, "macd"),
      // price: fetch_twelvedata_url(symbol, interval, start, end, "time_series"),
    };
  });
}

const OldStocks = () => {
  const intervals = [
    // "1min",
    // "3min",
    // "5min",
    // "15min",
    "30min",
    "45min",
    "1h",
    "2h",
    "3h",
    "4h",
    "1day",
    "1week",
    "1month",
  ];

  const [urls, setURLs] = useState([]);
  const [rsi, setRSI] = useState([]);
  const [macd, setMACD] = useState([]);
  const [price, setPrice] = useState([]);
  const [volume, setVolume] = useState([]);

  // Assuming useUser() is correctly implemented elsewhere
  const { status, data: user } = useUser();

  // Function to build URLs (omitted for brevity)
  // const buildURLs = (...) => { ... };


  // const fetch_data = useCallback(
    const fetch_data = () => {
    (urls) => {
      urls.forEach((element) => {
        fetch(element.rsi)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.values) {
              const cdata = data.values
                .map((d) => ({
                  time: d.datetime,
                  rsi: parseFloat(d.rsi),
                }))
                .sort((a, b) => new Date(b.time) - new Date(a.time));

              setRSI((prevRsi) => {
                const updatedRsi = [
                  ...prevRsi,
                  {
                    interval: element.interval,
                    datetime: cdata[0].time,
                    rsi: cdata[0].rsi,
                  },
                ].slice(-15);
                return updatedRsi;
              });
            }
          })
          .catch((error) => console.error("Error fetching RSI data:", error));

        fetch(element.macd)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.values) {
              const cdata = data.values
                .map((d) => ({
                  time: d.datetime,
                  macd: parseFloat(d.macd),
                  macd_signal: parseFloat(d.macd_signal),
                  macd_hist: parseFloat(d.macd_hist),
                }))
                .sort((a, b) => new Date(b.time) - new Date(a.time));

              setMACD((prevMACD) => {
                const updatedMacd = [
                  ...prevMACD,
                  {
                    interval: element.interval,
                    datetime: cdata[0].time,
                    macd: cdata[0].macd,
                    macd_signal: cdata[0].macd_signal,
                    macd_hist: cdata[0].macd_hist,
                  },
                ].slice(-15);
                return updatedMacd;
              });
            }
          })
          .catch((error) => console.error("Error fetching RSI data:", error));
      });
    }
}

  const generatedUrls = buildURLs(intervals); // Assume buildURLs is a stable function
  const test = fetch_data(generatedUrls);

  // useEffect(() => {
  //   // Calculate start date based on intervals and set URLs
  //   const generatedUrls = buildURLs(intervals); // Assume buildURLs is a stable function
  //   fetch_data(generatedUrls);
  //   // const intervalId = setInterval(fetch_data(generatedUrls), 60000);

  //   return () => clearInterval(intervalId);
  // }, [fetch_data]);

  if (rsi) {
    console.log(rsi);
  }
  // Additional logic and JSX
  return <div>TEST</div>;
};

export default OldStocks;
