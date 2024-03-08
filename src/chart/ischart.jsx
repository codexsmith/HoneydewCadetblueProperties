import React, { useEffect, useLayoutEffect, useRef } from "react";
// Import amCharts modules you need
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const IsChart = () => {
  const chartRef = useRef(null); // Ref for div where amChart will be rendered

  useLayoutEffect(() => {
    // Initialize chart
    let root = am5.Root.new(chartRef.current);

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    let stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {})
    );
    // ... continue with your chart setup here

    // Cleanup function to dispose chart when component unmounts
    return () => {
      root.dispose();
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div
      id="chartdiv"
      ref={chartRef}
      style={{ width: "100%", height: "500px" }}
    ></div>
  );
};

export default IsChart;
