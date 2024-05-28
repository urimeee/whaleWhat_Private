import React, { useEffect, useState, useRef } from "react";

const upbitBaseUrl = 'https://api.upbit.com/v1/candles';
const netflowUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/netflow_month';
const ethOutflowUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/LambdaFunctionWithRDS';
const ethInflowUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/wtb_value_month';
const ethOutflowFrequencyUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/btw_fre_month';
const ethOutflowDailyUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/btw_daily';
const ethInflowDailyUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/wtb_value_daily';
const ethOutflowFrequencyDailyUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/btw_fre_daily';
const ethInflowFrequencyMonthlyUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/wtb_fre_month';
const ethInflowFrequencyDailyUrl = 'https://g9glozrah7.execute-api.ap-northeast-2.amazonaws.com/default/wtb_fre_daily';

// Function to fetch data from API
async function fetchData(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`Fetched data from ${fullUrl}:`, data); // Log fetched data
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${fullUrl}:`, error);
        return [];
    }
}

// Function to render chart
function renderChart(data, containerId, titleText, chartType) {
    let chartData;
    let dataSeries = [];

    if (chartType === "candlestick") {
        chartData = data.map(item => ({
            x: new Date(item.candle_date_time_utc),
            y: [item.opening_price, item.high_price, item.low_price, item.trade_price],
        }));

        dataSeries.push({
            type: "candlestick",
            risingColor: "green",
            fallingColor: "red",
            dataPoints: chartData
        });
    } 
    if (chartType === "line") {
        chartData = data.map(item => ({
            x: new Date(item.candle_date_time_utc),
            y: item.trade_price,
        }));

        dataSeries.push({
            type: "line",
            lineColor: "#000feb",
            dataPoints: chartData
        });
    }
    if (chartType === "netflow") {
        chartData = data.map(item => {
            const dateParts = item.YearMonth.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1), // Year, Month (0-based)
                y: item.NetValue,
                color: item.NetValue >= 0 ? "green" : "red"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Netflow (ETH)",
            showInLegend: true,
            color: function(e) {
                return e.dataPoint.y >= 0 ? "green" : "red";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethoutflow") {
        chartData = data.map(item => {
            const dateParts = item.YearMonth.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1), // Year, Month (0-based)
                y: item.Value,
                color: "green"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Outflow Value (ETH)",
            showInLegend: true,
            color: function(e) {
                return "green";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethinflow") {
        chartData = data.map(item => {
            const dateParts = item.YearMonth.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1), // Year, Month (0-based)
                y: item.Value,
                color: "red"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Inflow Value (ETH)",
            showInLegend: true,
            color: function(e) {
                return "red";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethoutflowfrequency") {
        chartData = data.map(item => {
            const dateParts = item.YearMonth.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1), // Year, Month (0-based)
                y: item.TransactionCount,
                color: "green"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Outflow Frequency (ETH)",
            showInLegend: true,
            color: function(e) {
                return "green";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethoutflowdaily") {
        chartData = data.map(item => {
            const dateParts = item.Date.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1, dateParts[2]), // Year, Month (0-based), Day
                y: item.Value,
                color: "green"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Outflow Value (ETH) Daily",
            showInLegend: true,
            color: function(e) {
                return "green";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethinflowdaily") {
        chartData = data.map(item => {
            const dateParts = item.Time.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1, dateParts[2]), // Year, Month (0-based), Day
                y: item.Value,
                color: "red"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Inflow Value (ETH) Daily",
            showInLegend: true,
            color: function(e) {
                return "red";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethoutflowfrequencydaily") {
        chartData = data.map(item => {
            const dateParts = item.Time.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1, dateParts[2]), // Year, Month (0-based), Day
                y: item.Count,
                color: "green"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Outflow Frequency (ETH) Daily",
            showInLegend: true,
            color: function(e) {
                return "green";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethinflowfrequencymonthly") {
        chartData = data.map(item => {
            const dateParts = item.YearMonth.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1), // Year, Month (0-based)
                y: item.TransactionCount,
                color: "red"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Inflow Frequency (ETH) Monthly",
            showInLegend: true,
            color: function(e) {
                return "red";
            },
            dataPoints: chartData
        });
    }
    if (chartType === "ethinflowfrequencydaily") {
        chartData = data.map(item => {
            const dateParts = item.Time.split("-");
            return {
                x: new Date(dateParts[0], dateParts[1] - 1, dateParts[2]), // Year, Month (0-based), Day
                y: item.Count,
                color: "red"
            };
        });

        dataSeries.push({
            type: "column",
            name: "Inflow Frequency (ETH) Daily",
            showInLegend: true,
            color: function(e) {
                return "red";
            },
            dataPoints: chartData
        });
    }

    const axisYConfig = chartType === "netflow" ? {
        title: "Netflow (ETH)",
        labelFontColor: "white",
        titleFontColor: "white",
        minimum: -900000, // Adjust based on your data
        maximum: 600000  // Adjust based on your data
    } : {
        title: chartType.includes("outflow") ? "Outflow Value (ETH)" : chartType.includes("inflow") ? "Inflow Value (ETH)" : "Outflow Frequency (ETH)",
        labelFontColor: "white",
        titleFontColor: "white",
        minimum: 0, // Start from 0 for outflow and inflow
        maximum: Math.max(...chartData.map(d => d.y)) * 1.1  // Adjust based on your data
    };

    const chart = new CanvasJS.Chart(containerId, {
        theme: "dark2",
        backgroundColor: "#000000",
        title: { 
            text: titleText,
            fontColor: "white"
        },
        axisX: { 
            valueFormatString: chartType.includes("daily") ? "YYYY MMM" : "YYYY MMM",
            labelFontColor: "white"
        },
        axisY: axisYConfig,
        data: dataSeries
    });

    chart.render();
}
const ChartComponent = ({ market, unit, count, containerId, titleText, chartType }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const loadCanvasJS = () => {
        if (!window.CanvasJS) {
            const script = document.createElement("script");
            script.src = "https://canvasjs.com/assets/script/canvasjs.min.js";
            script.onload = () => fetchDataAndRender();
            document.body.appendChild(script);
        } else {
            fetchDataAndRender();
        }
    };

    const fetchDataAndRender = async () => {
      try {
        let response = [];
        if (chartType === "netflow") {
          response = await fetchData(netflowUrl);
        } else if (chartType === "ethoutflow") {
          response = await fetchData(ethOutflowUrl);
        } else if (chartType === "ethinflow") {
          response = await fetchData(ethInflowUrl);
        } else if (chartType === "ethoutflowfrequency") {
          response = await fetchData(ethOutflowFrequencyUrl);
        } else if (chartType === "ethoutflowdaily") {
          response = await fetchData(ethOutflowDailyUrl);
        } else if (chartType === "ethinflowdaily") {
          response = await fetchData(ethInflowDailyUrl);
        } else if (chartType === "ethoutflowfrequencydaily") {
          response = await fetchData(ethOutflowFrequencyDailyUrl);
        } else if (chartType === "ethinflowfrequencymonthly") {
          response = await fetchData(ethInflowFrequencyMonthlyUrl);
        } else if (chartType === "ethinflowfrequencydaily") {
          response = await fetchData(ethInflowFrequencyDailyUrl);
        } else {
          response = await fetchData(`${upbitBaseUrl}/${unit}`, { market, count });
        }

        if (response.length === 0) {
          setError('No data available');
        } else {
          setData(response);
          renderChart(response, containerId, titleText, chartType);
        }
      } catch (error) {
        setError('Error fetching data');
      }
    };

    loadCanvasJS();
  }, [market, unit, count, containerId, titleText, chartType]);

  // Scroll functionality
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleMouseDown = (event) => {
      isDragging.current = true;
      startX.current = event.pageX - scrollContainer.offsetLeft;
      scrollLeft.current = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      scrollContainer.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      scrollContainer.style.cursor = 'grab';
    };

    const handleMouseMove = (event) => {
      if (!isDragging.current) return;
      event.preventDefault();
      const x = event.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX.current) * 2;
      scrollContainer.scrollLeft = scrollLeft.current - walk;
    };

    scrollContainer.addEventListener("mousedown", handleMouseDown);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);
    scrollContainer.addEventListener("mouseup", handleMouseUp);
    scrollContainer.addEventListener("mousemove", handleMouseMove);

    return () => {
      scrollContainer.removeEventListener("mousedown", handleMouseDown);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      scrollContainer.removeEventListener("mouseup", handleMouseUp);
      scrollContainer.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="scroll-container" ref={scrollContainerRef} style={{ height: "500px" }}> {/* Increased height */}
      <div id={containerId} className="chart-wrapper" style={{ height: "500px" }}></div> {/* Increased height */}
    </div>
  );
};

export default ChartComponent;
