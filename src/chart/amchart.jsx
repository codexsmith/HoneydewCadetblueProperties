import React, { useEffect, useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function fetch_twelvedata(symbol, interval, startDate, endDate, requestedData) {
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

const symbol = "SHIB/USD";
const interval = "15min"; // 15min 1h
const start_date = "2022-11-19 20:28:00";
const end_date = "2022-11-20 20:28:00";

const macd_data_url = fetch_twelvedata(
  symbol,
  interval,
  start_date,
  end_date,
  "macd"
);
const rsi_url = fetch_twelvedata(symbol, interval, start_date, end_date, "rsi");
const price_url = fetch_twelvedata(
  symbol,
  interval,
  start_date,
  end_date,
  "time_series"
);

// Function that dynamically loads data
function loadData(dataURL, series, processor) {
  // Load external data
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Setting_data
  am5.net.load(dataURL).then(function (result) {
    // Parse loaded data
    var data = am5.JSONParser.parse(result.response);
    var timeseries = data.values;
    // data.values.forEach((item) => {
    //   item.Date = new Date(item.datetime);
    //   item.High = new Number(item.high);
    //   item.Low = new Number(item.low);
    //   item.Open = new Number(item.open);
    //   item.Close = new Number(item.close);
    // });

    processor.processMany(timeseries);

    // Set data
    am5.array.each(series, function (item) {
      item.data.setAll(timeseries);
    });
  });
}

const AmChart = () => {
  const chartRef = useRef(null); // Ref for the chart container div

  useLayoutEffect(() => {
    let root = am5.Root.new("chartdiv");

    var processor = am5.DataProcessor.new(root, {
      dateFields: ["datetime"],
      dateFormat: "yyyy-MM-dd",
      numericFields: ["open", "high", "low", "close"],
    });

    root.setThemes([am5themes_Animated.new(root)]);

    let stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {})
    );
    root.numberFormatter.set("numberFormat", "#,###.00");

    let mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: true,
        height: am5.percent(70),
      })
    );

    let valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" }),
        tooltip: am5.Tooltip.new(root, {}),
        numberFormat: "#,###.00",
        extraTooltipPrecision: 2,
      })
    );

    let dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: { timeUnit: "minute", count: 15 },
        groupData: true,
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    let valueSeries = mainPanel.series.push(
      am5xy.CandlestickSeries.new(root, {
        name: "SHIB",
        valueXField: "Date",
        valueYField: "Close",
        highValueYField: "High",
        lowValueYField: "Low",
        openValueYField: "Open",
        calculateAggregates: true,
        xAxis: dateAxis,
        yAxis: valueAxis,
        legendValueText: "{valueY}",
      })
    );

    stockChart.set("stockSeries", valueSeries);

    let valueLegend = mainPanel.plotContainer.children.push(
      am5stock.StockLegend.new(root, { stockChart })
    );
    valueLegend.data.setAll([valueSeries]);

    mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        snapToSeries: [valueSeries],
        snapToSeriesBy: "y!",
      })
    );

    let scrollbar = mainPanel.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 50,
      })
    );
    stockChart.toolsContainer.children.push(scrollbar);

    let sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: { timeUnit: "minute", count: 15 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    let sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    let sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "Close",
        valueXField: "Date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis,
      })
    );
    sbSeries.fills.template.setAll({ visible: true, fillOpacity: 0.3 });

    // Placeholder for data loading logic
    loadData(price_url, [valueSeries, sbSeries], processor);

    chartRef.current = stockChart; // Store the chart instance

    return () => root.dispose();
  });

  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
};

export default AmChart;
