"use client";

import { useState, useEffect } from "react";
import Card from "../components/Card";
import TargetChart from "../components/TargetChart";
import SalesChart from "../components/SalesChart";
import SalesSourceChart from "../components/SalesSourceChart";
import TopProducts from "../components/TopProducts";
import TopCategories from "../components/TopCategories";
import RecentOrders from "../components/RecentOrders";
import CustomerGrowth from "../components/CustomerGrowth";

const Dashboard = () => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const stored = sessionStorage.getItem("userData");
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  }, []);

  return (
    <>
      <div className={`container mx-auto p-1`}>
        <h1 className='text-3xl font-semibold'>{`Welcome Back ${
          userData?.firstName ?? ""
        }`}</h1>
        <p className='mb-4 text-gray-500'>
          {`Lorem ipsum dolor si amet welcome back  ${
            userData?.firstName ?? ""
          }`}
        </p>

        <Card />

        {/* Statistics Section */}
        <div className='flex gap-0 md:gap-6 flex-col md:flex-row'>
          <TargetChart percentage={75.55} today='$1.5k' />
          <SalesChart />
        </div>
        {/* Sales Chart */}
        <div className='flex gap-0 md:gap-6 flex-col md:flex-row'>
          <SalesSourceChart />
          <TopProducts />
          <TopCategories />
        </div>
        <div className='flex gap-0 md:gap-6 flex-col md:flex-row'>
          <RecentOrders />
          <CustomerGrowth />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
