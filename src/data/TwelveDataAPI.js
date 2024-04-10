export function fetch_twelvedata_url(
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

  return `${url}?${params.toString()}`;
}

// const symbol = "SHIB/USD";
// const interval = "15min"; // 15min 1h
// const start_date = "2022-11-19 20:28:00";
// const end_date = "2022-11-20 20:28:00";

// export const macd_data_url = fetch_twelvedata(
//   symbol,
//   interval,
//   start_date,
//   end_date,
//   "macd"
// );
// const rsi_url = export function fetch_twelvedata_url(
//     (symbol, interval, start_date, end_date, "rsi");
// const price_url = fetch_twelvedata(
//   symbol,
//   interval,
//   start_date,
//   end_date,
//   "time_series"
// );
