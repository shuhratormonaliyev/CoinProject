import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CryptoDetail = ({ currency = "INR" }) => {
  const [coinData, setCoinData] = useState([]);
  const [chartData, setChartData] = useState({ datasets: [{ data: [] }] });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("24 Hours");
  const { coinId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoinData();
  }, [coinId, timeframe]);

  const fetchCoinData = async () => {
    try {
      const [coinResponse, marketChartResponse] = await Promise.all([
        fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`),
        fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${getTimeframeDays(
            timeframe
          )}`
        ),
      ]);
      const coinData = await coinResponse.json();
      const marketChartData = await marketChartResponse.json();
      setCoinData(coinData);
      setChartData(formatChartData(marketChartData.prices, timeframe));
      setLoading(false);
    } catch (error) {
      console.error("Plase wait...", error);
      setLoading(false);
    }
  };

  const getTimeframeDays = (timeframe) => {
    switch (timeframe) {
      case "24 Hours":
        return 1;
      case "30 Days":
        return 30;
      case "3 Months":
        return 90;
      case "1 Year":
        return 365;
      default:
        return 1;
    }
  };

  const formatChartData = (prices, timeframe) => {
    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      switch (timeframe) {
        case "24 Hours":
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        case "30 Days":
        case "3 Months":
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        case "1 Year":
          return date.toLocaleDateString([], {
            month: "short",
            year: "numeric",
          });
        default:
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
      }
    };

    return {
      labels: prices.map((price) => formatDate(price[0])),
      datasets: [
        {
          data: prices.map((price) => price[1]),
          fill: true,
        },
      ],
    };
  };

  if (loading || !coinData) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#7dd3fc]">
          <span className="loading loading-spinner loading-lg text-info"></span>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(125, 211, 252, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#4b5563",
          maxRotation: 0,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(125, 211, 252, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#4b5563",
          callback: (value) => value.toLocaleString(),
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#374151",
        titleColor: "#7dd3fc",
        bodyColor: "#fff",
        padding: 12,
        displayColors: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderColor: "#7dd3fc",
        borderWidth: 2,
        fill: true,
        backgroundColor: "rgba(125, 211, 252, 0.1)",
      },
      point: {
        radius: 0,
        hitRadius: 0,
      },
    },
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setLoading(true);
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <header className="flex justify-between items-center p-4 border-b border-blue-900/20">
          <h1 className="text-2xl font-bold text-cyan-400">CRYPTOFOLIO</h1>
        </header>

        <div className="grid grid-cols-[300px,1fr] gap-12">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center pr-24">
              <img
                src={coinData.image.large}
                alt={coinData.name}
                className="w-32 h-32 mb-4"
              />
              <h2 className="text-4xl font-bold text-white mb-4">
                {coinData.name}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {coinData.description.en.split(". ")[0]}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-gray-400">Rank:</p>
                <p className="text-2xl text-white font-bold">
                  <span className="text-gray-300">
                    {coinData.market_cap_rank.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-400">Current Price</p>
                <p className="text-3xl text-white font-bold">
                  ₹{" "}
                  <span className="text-gray-300">
                    {coinData.market_data.current_price[
                      currency.toLowerCase()
                    ].toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-400">Market Cap</p>
                <p className="text-2xl text-white">
                  ₹{" "}
                  {(
                    coinData.market_data.market_cap[currency.toLowerCase()] /
                    1000000
                  ).toLocaleString()}{" "}
                  M
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[#7dd3fc] text-sm">
                Price ( Past 1 Days ) in {currency}
              </p>
            </div>
            <div className="h-[600px] relative">
              <Line options={chartOptions} data={chartData} />
              <div className="absolute bottom-[-90px] left-0 right-0 flex justify-between gap-4 pb-4">
                {["24 Hours", "30 Days", "3 Months", "1 Year"].map((period) => (
                  <button
                    key={period}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                      timeframe === period
                        ? "bg-[#7dd3fc] text-[#1a1a1a]"
                        : "bg-[#374151] text-white hover:bg-[#4b5563]"
                    }`}
                    onClick={() => handleTimeframeChange(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDetail;
