import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useAuth, useUser } from "reactfire";

const Stock = () => {
  const rootRef = useRef(null);

  const { status, data: user } = useUser();
  const auth = useAuth();

  useEffect(() => {
    const root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);
    const stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {}),
    );
    root.numberFormatter.set("numberFormat", "#,###.00");

    const mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: true,
        height: am5.percent(70),
      }),
    );

    const valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" }),
        tooltip: am5.Tooltip.new(root, {}),
        numberFormat: "#,###.00",
        extraTooltipPrecision: 2,
      }),
    );

    const dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        groupData: true,
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    const valueSeries = mainPanel.series.push(
      am5xy.CandlestickSeries.new(root, {
        name: "SHIB-USD",
        valueXField: "Date",
        valueYField: "Close",
        highValueYField: "High",
        lowValueYField: "Low",
        openValueYField: "Open",
        calculateAggregates: true,
        xAxis: dateAxis,
        yAxis: valueAxis,
        legendValueText: "{valueY}",
      }),
    );

    stockChart.set("stockSeries", valueSeries);
    const valueLegend = mainPanel.plotContainer.children.push(
      am5stock.StockLegend.new(root, {
        stockChart: stockChart,
      }),
    );
    valueLegend.data.setAll([valueSeries]);

    mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        snapToSeries: [valueSeries],
        snapToSeriesBy: "y!",
      }),
    );

    const scrollbar = mainPanel.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 50,
      }),
    );
    stockChart.toolsContainer.children.push(scrollbar);

    const sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      }),
    );

    const sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    const sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "Close",
        valueXField: "Date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis,
      }),
    );

    sbSeries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3,
    });

    // Assign to ref to access in cleanup
    rootRef.current = root;

    // loadDataFromFirebase("SHIB-USD", [valueSeries, sbSeries]);
    loadDataFromCoinbase("SHIB-USD", [valueSeries, sbSeries]);

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
      }
    };
  }, []);

  const generateStartEndDates = (seedDate, interval) => {
    let startDate,
      endDate = "";

    const maxCount = 275;

    //given a seedDate and an interval
    //calculate the endDate that is maxCount * interval away from seedDate

    return { start: startDate, end: endDate };
  };

  const loadDataFromCoinbase = async (ticker, series) => {
    // Parameters setup
    const params = {
      start: "2024-01-04",
      end: "2024-05-13",
      // granularity: "900", //15 minutes
      granularity: "86400", //day
    };

    try {
      // Ensure the user is authenticated and an ID token can be obtained
      if (!user) {
        throw new Error("User not authenticated");
      }

      const idToken = await auth.currentUser.getIdToken(true);

      // Prepare the request URL with query parameters
      const query = new URLSearchParams(params).toString();
      // const requestUrl = `https://us-central1-your-project-id.cloudfunctions.net/fetchProductCandles?productId=${ticker}&${query}`;
      const requestUrl = `http://localhost:5001/projectrlive-dev/us-central1/fetchProductCandlesFromCoinbase?productId=${ticker}&${query}`;

      // Fetch the data with Authorization header
      const response = await fetch(requestUrl, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Check if the response was ok
      if (!response.ok) {
        throw new Error("Failed to fetch product candles");
      }

      const candleData = await response.json();

      // Process the data to fit AmCharts
      const processedData = candleData.map((candle) => ({
        Date: candle[0] * 1000,
        Low: candle[1],
        High: candle[2],
        Open: candle[3],
        Close: candle[4],
        Volume: candle[5],
      }));

      am5.array.each(series, function (item) {
        item.data.setAll(processedData);
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  return (
    <>
      <div
        id="chartcontrols"
        style={{ height: "auto", padding: "5px 45px 0 15px" }}
      ></div>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    </>
  );
};

export default Stock;
