import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

function StockChart() {
  const chartContainerRef = useRef();
  const chart = useRef(null);
  const series = useRef(null);

  function oldchart() {
    if (!chart.current) {
      chart.current = createChart(chartContainerRef.current, {
        width: 600,
        height: 300,
      });
      series.current = chart.current.addCandlestickSeries();
    }
    //get technical indicators for previous 48 hours
    //1m,3m,5m,10m,15m,30m,45m,1h,2h,3h,4h,8h,12h,1D
    //macd & rsi interval deltas
    fetch(
      `https://api.twelvedata.com/time_series?apikey=d1e54380510f4be080f4dea9db380ae5&interval=1h&symbol=SHIB/USD&outputsize=12&dp=8&start_date=2024-03-04&end_date=2024-03-05`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.values) {
          console.log({ data });

          const cdata = data.values
            .map((d) => ({
              time: d.datetime,
              open: parseFloat(d.open),
              high: parseFloat(d.high),
              low: parseFloat(d.low),
              close: parseFloat(d.close),
            }))
            .sort((a, b) => new Date(a.time) - new Date(b.time));
          console.log({ cdata });

          series.current.setData(cdata);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));

    return () => {
      chart.current.remove();
      chart.current = null;
    };
  }

  async function fetchTwelveData(
    symbol,
    interval,
    startDate,
    endDate,
    requestedData
  ) {
    const url = `https://api.twelvedata.com/${requestedData}`;
    const params = new URLSearchParams({
      apikey: "d1e54380510f4be080f4dea9db380ae5", // It's best practice to not hard-code API keys in your codebase.
      symbol,
      interval,
      start_date: startDate,
      end_date: endDate,
      dp: 11,
      format: "JSON",
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.values;
    } catch (error) {
      console.error("Error fetching data from TwelveData API:", error);
      return []; // Return an empty array or handle the error as needed
    }
  }

  const symbol = "SHIB/USD";
  const interval = "15min"; // 15min 1h
  const start_date = "2022-11-19 20:28:00";
  const end_date = "2022-11-27 20:28:00";

  const macd_data = fetch_twelvedata(
    symbol,
    interval,
    start_date,
    end_date,
    "macd"
  );
  const rsi = fetch_twelvedata(symbol, interval, start_date, end_date, "rsi");
  const price = fetch_twelvedata(
    symbol,
    interval,
    start_date,
    end_date,
    "time_series"
  );

  useEffect(() => {}, []);

  return <div ref={chartContainerRef} />;
}
export default StockChart;
