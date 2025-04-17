import axios from "axios";
import React, { useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const TopProducts = ({ onLoaded }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/dashboard/top-products")
      .then((response) => {
        setTopProducts(response.data);
        setIsLoading(false);
        onLoaded?.();
      })
      .catch((error) => {
        console.error("Error fetching top products data:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className='bg-white p-6 rounded-lg shadow-lg mb-6 w-full md:w-[34%] max-h-[500px] overflow-y-auto hide-scrollbar'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='text-xl text-dark-100 font-medium mb-2'>
            Top Product
          </h3>
          <p className='text-grey-700 text-sm font-medium mb-5'>
            Top Product in This Month
          </p>
        </div>
        <button className='text-gray-400 hover:text-gray-600'>
          <BsThreeDotsVertical size={18} />
        </button>
      </div>
      {isLoading ? (
        <div className='h-[372px] w-full flex justify-center items-center'>
          <div className='w-12 h-12 rounded-full animate-spin border-2 border-solid border-[#2086bfd9] border-t-transparent'></div>
        </div>
      ) : (
        <div className='space-y-4'>
          {topProducts.map((product, index) => (
            <div key={index} className='flex justify-between items-center'>
              <div className='flex gap-3'>
                <div className='w-[40px] h-[40px] bg-orange-800 rounded-[8px]'></div>
                <div className='flex flex-col'>
                  <h6 className='font-semibold text-sm text-dark-100'>
                    {product.name}
                  </h6>
                  <p className='text-xs font-medium text-grey-800'>
                    {product.category}
                  </p>
                </div>
              </div>
              <div className='font-semibold text-dark-100 text-sm'>
                {product.totalSales}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;
