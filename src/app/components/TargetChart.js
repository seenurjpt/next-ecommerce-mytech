import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import Loader from "./Loader";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const TargetChart = ({ percentage, today }) => {
  const [isClient, setIsClient] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    axios
      .get("/api/dashboard/revenue")
      .then((response) => {
        setRevenueData(response.data.data || response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error fetching revenue data:",
          error.response?.data?.message || error.message
        );
        setLoading(false);
      });
  }, []);

  const chartOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      height: "400",
    },
    stroke: {
      width: 20, // Thin border
    },
    plotOptions: {
      radialBar: {
        startAngle: -90, // Start angle for half-circle
        endAngle: 90, // End angle for half-circle
        hollow: {
          size: "75%", // Adjust hollow size to create space for the text
        },
        dataLabels: {
          show: true,
          value: {
            fontSize: "28px", // Larger value text
            color: "#333",
            fontWeight: "bold",
            offsetY: -40, // Adjust the position of the value text to add margin
          },
          name: {
            show: false,
            formatter: function (val) {
              return `<div style="background: #E9FAF7; padding: 5px; border-radius: 10px;">${val}</div>`;
            },
          },
        },
      },
    },
    labels: ["Progress"],
    colors: ["#2086BF"], // Blue color for the progress
  };

  const chartData = [percentage];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-[100%] md:w-[31%]">
      {loading && revenueData.length === 0 ? (
        <div className="flex justify-center items-center w-[360px] h-[372px]">
          <Loader />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl text-dark-100 font-medium mb-2">Target</h3>
              <p className="text-grey-700 text-sm font-medium mb-2">
                Revenue Target
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <BsThreeDotsVertical size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center mt-6 relative">
            <ApexCharts
              options={chartOptions}
              series={chartData}
              type="radialBar"
              height={350}
            />
            <div className="bg-green-light text-green-700 text-[12px] font-bold top-[121px] absolute rounded-[6px]">
              +10%
            </div>
            <div className="mt-[-30px] text-center">
              <div className="text-sm text-grey-800 px-2">
                You succeed earn {today} today, it's higher than yesterday
              </div>
            </div>
            <div className="mt-4 flex justify-between w-full px-[30px] text-center text-sm text-gray-600">
              {revenueData.map((item) => (
                <div key={item.name}>
                  <div className="font-semibold">{item.name}</div>
                  <div className="flex items-center gap-[5px]">
                    ${item.revenue}{" "}
                    <Image
                      src={
                        item.average === "profit"
                          ? "/upArrow.svg"
                          : "/downArrow.svg"
                      }
                      width={10}
                      height={10}
                      alt="arrow"
                      className="mt-[2px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
        )}
        </div>
  );
};

export default TargetChart;
