import React, { Component } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

class Stock extends Component {
  componentDidMount() {
    var root = am5.Root.new("chartdiv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create a stock chart
    // https://www.amcharts.com/docs/v5/charts/stock-chart/#Instantiating_the_chart
    var stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {})
    );

    // Set global number format
    // https://www.amcharts.com/docs/v5/concepts/formatters/formatting-numbers/
    root.numberFormatter.set("numberFormat", "#,###.00");

    //
    // Main (value) panel
    //

    // Create a main stock panel (chart)
    // https://www.amcharts.com/docs/v5/charts/stock-chart/#Adding_panels
    var mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: true,
        height: am5.percent(70),
      })
    );

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom",
        }),
        tooltip: am5.Tooltip.new(root, {}),
        numberFormat: "#,###.00",
        extraTooltipPrecision: 2,
      })
    );

    var dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: {
          timeUnit: "day",
          count: 1,
        },
        groupData: true,
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var valueSeries = mainPanel.series.push(
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
      })
    );

    // Set main value series
    // https://www.amcharts.com/docs/v5/charts/stock-chart/#Setting_main_series
    stockChart.set("stockSeries", valueSeries);

    // Add a stock legend
    // https://www.amcharts.com/docs/v5/charts/stock-chart/stock-legend/
    var valueLegend = mainPanel.plotContainer.children.push(
      am5stock.StockLegend.new(root, {
        stockChart: stockChart,
      })
    );
    valueLegend.data.setAll([valueSeries]);

    // Add cursor(s)
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        snapToSeries: [valueSeries],
        snapToSeriesBy: "y!",
      })
    );

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    var scrollbar = mainPanel.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 50,
      })
    );
    stockChart.toolsContainer.children.push(scrollbar);

    var sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: {
          timeUnit: "day",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    var sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    var sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "Close",
        valueXField: "Date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis,
      })
    );

    sbSeries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3,
    });

    // Function that dynamically loads data
    async function loadData(ticker, series) {
      // Parameters setup
      const params = {
        start: "01-01-2024",
        end: "04-04-2024",
        granularity: "ONE_DAY",
      };

      try {
        // Ensure the user is authenticated and an ID token can be obtained
        if (!firebase.auth().currentUser) {
          throw new Error("User not authenticated");
        }

        const idToken = await firebase.auth().currentUser.getIdToken(true);

        // Prepare the request URL with query parameters
        const query = new URLSearchParams(params).toString();
        const requestUrl = `https://us-central1-your-project-id.cloudfunctions.net/fetchProductCandles?productId=${ticker}&${query}`;

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
          date: new Date(candle[0] * 1000), // Assuming the first element is the UNIX timestamp
          open: candle[1], // Open price
          high: candle[2], // High price
          low: candle[3], // Low price
          close: candle[4], // Close price
          volume: candle[5], // Volume
        }));

        // Update series data
        series.forEach((s) => s.data.setAll(processedData));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }

    // Load initial data for the first series
    loadData("SHIB-USD", [valueSeries, sbSeries]);

    // Stock toolbar
    // -------------------------------------------------------------------------------
    // https://www.amcharts.com/docs/v5/charts/stock/toolbar/
    var toolbar = am5stock.StockToolbar.new(root, {
      container: document.getElementById("chartcontrols"),
      stockChart: stockChart,
      controls: [
        am5stock.IndicatorControl.new(root, {
          stockChart: stockChart,
          legend: valueLegend,
        }),
        am5stock.DateRangeSelector.new(root, {
          stockChart: stockChart,
        }),
        am5stock.PeriodSelector.new(root, {
          stockChart: stockChart,
        }),
        am5stock.DrawingControl.new(root, {
          stockChart: stockChart,
        }),
        am5stock.ResetControl.new(root, {
          stockChart: stockChart,
        }),
        am5stock.SettingsControl.new(root, {
          stockChart: stockChart,
        }),
      ],
    });

    this.root = root;
  }

  componentWillUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  }

  render() {
    return [
      <div
        key="chartcontrols"
        id="chartcontrols"
        style={{ height: "auto", padding: "5px 45px 0 15px" }}
      ></div>,
      <div
        key="chartdiv"
        id="chartdiv"
        style={{ width: "100%", height: "500px" }}
      ></div>,
    ];
  }
}

export default Stock;
