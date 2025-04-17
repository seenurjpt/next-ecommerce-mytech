"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const formatCurrency = (value) => {
  if (!value && value !== 0) return "$0k";
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value}`;
};

const SalesSourceChart = ({ onLoaded }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);

    axios
      .get("/api/dashboard/sales")
      .then((response) => {
        const data = response.data;
        if (
          !data ||
          !data.sources ||
          typeof data.totalSales === "undefined" ||
          typeof data.percentage === "undefined"
        ) {
          throw new Error("Invalid data structure received");
        }

        setChartData(data);
        setIsLoading(false);
        onLoaded?.();
      })
      .catch((error) => {
        console.error("Error fetching or parsing sales data:", error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  if (error) {
    return <div className="text-red-500">Error loading data: {error}</div>;
  }

  const chartColors = ["#1E4DB7", "#4EA5D9", "#87CEEB", "#B0E0E6"];
  const chartOptions = {
    chart: {
      type: "donut",
      height: 350,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "90%",
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
              color: "#333",
              offsetY: -5,
              formatter: function (val) {
                return formatCurrency(chartData.totalSales);
              },
            },
            total: {
              show: true,
              showAlways: true,
              label: "",
              fontSize: "16px",
              fontWeight: "500",
              color: "#10b981",
              offsetY: 5,
              formatter: function (w) {
                const perc = chartData.percentage;
                let displayPerc = "";
                if (typeof perc === "string") {
                  displayPerc =
                    perc.startsWith("+") || perc.startsWith("-")
                      ? perc
                      : `+${perc}`;
                  displayPerc = displayPerc.endsWith("%")
                    ? displayPerc
                    : `${displayPerc}%`;
                } else if (typeof perc === "number") {
                  displayPerc = `${perc > 0 ? "+" : ""}${perc}%`;
                } else {
                  return "";
                }
                return displayPerc;
              },
            },
          },
        },
      },
    },
    labels: chartData?.sources?.map((source) => source.name),
    colors: chartColors,
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value) {
          return `$${value.toLocaleString()}`;
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      show: true,
      width: 1,
      lineCap: "round",
      colors: ["transparent"],
    },
  };

  const chartDataSeries = chartData?.sources?.map((source) => source.amount);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full md:w-[31%]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl text-dark-100 font-medium mb-2">
            Sales Source
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <BsThreeDotsVertical size={18} />
        </button>
      </div>
      {isLoading ? (
        <div className="h-[372px] bg-white flex justify-center items-center">
          <div className="w-12 h-12 rounded-full animate-spin border-2 border-solid border-[#2086bfd9] border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div
            className="flex justify-center mb-4"
            style={{ minHeight: "250px" }}
          >
            {typeof window !== "undefined" && (
              <ApexCharts
                options={chartOptions}
                series={chartDataSeries}
                type="donut"
                height={250}
                width={"100%"}
              />
            )}
          </div>

          <div className="mt-6 space-y-2">
            {chartData.sources.map((source, index) => (
              <div
                key={source.name}
                className="flex items-center justify-between text-sm text-gray-700"
              >
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: chartColors[index % chartColors.length],
                    }}
                  ></span>
                  {source.name}
                </div>
                <div className="font-medium">
                  ${source.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesSourceChart;
