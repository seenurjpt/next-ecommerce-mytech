import axios from "axios";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const TopCategories = ({ onLoaded }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("/api/dashboard/top-categories")
      .then((response) => {
        setCategories(response.data);
        onLoaded?.();
      })
      .catch((error) => {
        console.error("Error fetching top categories data:", error);
      });
  }, []);

  return (
    <div className='bg-white p-6 rounded-lg shadow-lg mb-6 w-full md:w-[34%] max-h-[500px] overflow-y-auto scrollbar-hide'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='text-xl text-dark-100 font-medium mb-2'>
            Top Category
          </h3>
          <p className='text-grey-700 text-sm font-medium mb-2'>
            Top Category in This Month
          </p>
        </div>
        <button className='text-gray-400 hover:text-gray-600'>
          <BsThreeDotsVertical size={18} />
        </button>
      </div>
      <div>
        {categories.map((category, index) => (
          <div key={index} className='flex justify-between items-center pt-3'>
            <div className='flex items-center'>
              <div>
                <Image
                  src={category.img}
                  width={40}
                  height={40}
                  alt={category.name}
                />
              </div>
              <div className='font-semibold ml-2 text-dark-100'>
                {category.name}
              </div>
            </div>
            <div className='flex items-center'>
              <div className='text-lg text-dark-100 font-semibold'>
                {category.count}
              </div>
              <div
                className={`ml-2 text-xs font-semibold rounded-[6px] p-1`}
                style={{
                  backgroundColor: category.bgColor,
                  color: category.color,
                }}
              >
                {category.percentage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCategories;
