"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const SalesChart = ({ onLoaded }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios
      .get("/api/dashboard/chart")
      .then((response) => {
        setData(response.data.data || response.data);
        setLoading(false);
        onLoaded?.();
      })
      .catch((error) => {
        setLoading(false);
        console.error(
          "Error fetching chart data:",
          error.response?.data?.message || error.message
        );
      });
  }, []);

  const chartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    title: {
      text: "Revenue and Sales",
      align: "left",
      style: {
        fontSize: "14px",
        fontWeight: "400",
        color: "#4A4C56",
      },
    },
    xaxis: {
      categories: data.map((item) => item.month),
      title: {
        text: "Month",
        style: {
          fontSize: "14px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: true,
      },
      grid: {
        show: true,
        borderColor: "#e0e0e0",
        strokeDashArray: 4,
      },
    },
    yaxis: {
      title: {
        text: "Value",
        style: {
          fontSize: "14px",
        },
      },
      grid: {
        show: true,
        borderColor: "#e0e0e0",
        strokeDashArray: 4,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => `$${value}`,
      },
    },
    colors: ["#2086BF", "#F86624"],
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -30,
      offsetX: -20,
    },
  };

  const chartData = [
    {
      name: "Revenue",
      data: data.map((item) => item.revenue),
    },
    {
      name: "Sales",
      data: data.map((item) => item.sales),
    },
  ];

  return (
    <div className='bg-white p-6 rounded-lg shadow-lg mb-6 w-full md:w-[70%]'>
      <h3 className='text-dark-100 font-bold text-[20px] ml-2'>
        {!loading && "Statistic"}
      </h3>
      {loading ? (
        <div className='h-[372px] w-full flex justify-center items-center'>
          <div className='w-12 h-12 rounded-full animate-spin border-2 border-solid border-[#2086bfd9] border-t-transparent'></div>
        </div>
      ) : (
        <ApexCharts
          options={chartOptions}
          series={chartData}
          type='line'
          height={350}
        />
      )}
    </div>
  );
};

export default SalesChart;
