import React, { useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { ApexOptions } from "apexcharts";
import "../styles/statistics.css";

// Types
type DataEntry = {
  [key: string]: string | number | undefined;
  date?: string;
  timestamp?: string;
  Date?: string;
  close?: number;
  Close?: number;
};

type PredictionResponse = {
  symbol: string;
  dates: string[];
  predicted: number[];
};

// Constants
const stockSymbols = [
  "AAPL", "META", "AMZN", "NFLX", "GOOGL",
  "MSFT", "TSLA", "NVDA", "BRK-B", "JPM",
  "V", "JNJ", "WMT", "UNH", "PG"
];

const goldPurities = [
  "24K", "22K", "21K", "18K", 
  "14K", "12K", "10K", "9K"
];

const timeRanges = ["5y", "3y", "1y", "6mo", "3mo", "1mo", "7d", "1d"];
const allButtons = [...timeRanges, "predict"];

export default function StatisticsChart() {
  // Stock state
  const [selectedStock, setSelectedStock] = useState<string>("AAPL");
  const [stockCategories, setStockCategories] = useState<string[]>([]);
  const [stockData, setStockData] = useState<number[]>([]);
  const stockScrollRef = useRef<HTMLDivElement>(null);

  // Gold state
  const [selectedPurity, setSelectedPurity] = useState<string>("24K");
  const [goldCategories, setGoldCategories] = useState<string[]>([]);
  const [goldData, setGoldData] = useState<number[]>([]);
  const goldScrollRef = useRef<HTMLDivElement>(null);

  // Shared state
  const [range, setRange] = useState<string>("1y");

  const fetchData = async (symbol: string, isGold: boolean = false) => {
    try {
      const endpoint = range === "predict" ? "/predict" : "/historical";
      const baseUrl = isGold ? "http://localhost:8000/api/gold" : "http://localhost:8000";

      const params = isGold
        ? range === "predict"
          ? { symbol, purity: selectedPurity }
          : { symbol, period: range, purity: selectedPurity }
        : range === "predict"
          ? { symbol }
          : { symbol, period: range };

      const response = await axios.get(`${baseUrl}${endpoint}`, { params });

      if (range === "predict") {
        const { dates, predicted } = response.data;
        if (isGold) {
          setGoldCategories(dates);
          setGoldData(predicted);
        } else {
          setStockCategories(dates);
          setStockData(predicted);
        }
      } else {
        const rawData = response.data.data || response.data.historical;
        const processed = processHistoricalData(rawData);

        if (isGold) {
          setGoldCategories(processed.categories);
          setGoldData(processed.values);
        } else {
          setStockCategories(processed.categories);
          setStockData(processed.values);
        }
      }
    } catch (err) {
      console.error(`❌ Error fetching ${isGold ? 'gold' : 'stock'} data:`, err);
    }
  };

  const processHistoricalData = (data: DataEntry[]) => {
    const result: { categories: string[]; values: number[] } = {
      categories: [],
      values: []
    };

    data.forEach(entry => {
      const rawDate = entry.date ?? entry.timestamp ?? entry.Date;
      const close = entry.close ?? entry.Close;

      if (!rawDate || close === undefined) return;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return;

      const label = range === "1d"
        ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString("en-US");

      result.categories.push(label);
      result.values.push(close);
    });

    return result;
  };

  const createChartOptions = (color: string, categories: string[]): ApexOptions => ({
    colors: [color],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 0, hover: { size: 5 } },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      x: { format: "d M yy H:m" },
      y: { formatter: (val: number) => val.toFixed(2) },
    },
    xaxis: {
      type: "category",
      categories,
      labels: {
        style: { fontSize: "11px", colors: ["#6B7280"] },
        rotate: -45,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
      title: { text: "" },
    },
  });

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollBy({ left: -200, behavior: "smooth" });

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    fetchData(selectedStock);
    fetchData(selectedPurity, true);
  }, [range, selectedStock, selectedPurity]);

  // Prepare chart series
  const stockSeries = [{ name: "Close Price", data: stockData }];
  const goldSeries = [{ name: "Gold Price", data: goldData }];

  // Prepare chart options
  const stockOptions = createChartOptions("#465FFF", stockCategories);
  const goldOptions = createChartOptions("#FFD700", goldCategories);

  return (
    <div className="statistics-wrapper">
      {/* Stock Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Stock Statistics ({selectedStock})</h3>
            <p className="chart-subtitle">
              View historical data or forecasted 15-day predictions
            </p>
          </div>
        </div>

        <div className="button-container" ref={stockScrollRef}>
          <button onClick={() => scrollLeft(stockScrollRef)} className="symbol-btn">
            ←
          </button>
          {stockSymbols.map((sym) => (
            <button
              key={sym}
              className={`symbol-btn ${sym === selectedStock ? 'selected' : ''}`}
              onClick={() => setSelectedStock(sym)}
            >
              {sym}
            </button>
          ))}
          <button onClick={() => scrollRight(stockScrollRef)} className="symbol-btn">
            →
          </button>
        </div>

        <div className="button-container">
          {allButtons.map((r) => (
            <button
              key={r}
              className={`range-btn ${r === range ? 'selected' : ''}`}
              onClick={() => setRange(r)}
            >
              {r === "predict" ? "PREDICTIONS" : r.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="chart-wrapper">
          <Chart options={stockOptions} series={stockSeries} type="area" height={350} />
        </div>
      </div>

      {/* Gold Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Gold Statistics ({selectedPurity})</h3>
            <p className="chart-subtitle">
              View historical data or forecasted 15-day predictions
            </p>
          </div>
        </div>

        <div className="button-container" ref={goldScrollRef}>
          <button onClick={() => scrollLeft(goldScrollRef)} className="symbol-btn">
            ←
          </button>
          {goldPurities.map((purity) => (
            <button
              key={purity}
              className={`symbol-btn gold-symbol-btn ${purity === selectedPurity ? 'selected' : ''}`}
              onClick={() => setSelectedPurity(purity)}
            >
              {purity}
            </button>
          ))}
          <button onClick={() => scrollRight(goldScrollRef)} className="symbol-btn">
            →
          </button>
        </div>

        <div className="button-container">
          {allButtons.map((r) => (
            <button
              key={r}
              className={`range-btn ${r === range ? 'selected' : ''}`}
              onClick={() => setRange(r)}
            >
              {r === "predict" ? "PREDICTIONS" : r.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="chart-wrapper">
          <Chart options={goldOptions} series={goldSeries} type="area" height={350} />
        </div>
      </div>
    </div>
  );
}
