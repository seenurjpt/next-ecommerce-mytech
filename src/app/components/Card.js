"use client";
import axios from "axios";
import Image from "next/image";
import { useState, useEffect } from "react";
import Loader from "./Loader";

const Card = () => {
  const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/dashboard/cards")
      .then((response) => {
        setCardsData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error fetching cards data:",
          error.response?.data?.message || error.message
        );
      });
  }, []);

  return (
    <>
      {isLoading ? (
        <div className='flex justify-center items-center h-[146px]'>
          <Loader />
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
          {cardsData.map((card, index) => {
            return (
              <div
                className='bg-white p-[15px] rounded-lg shadow-lg relative flex flex-col gap-[5px]'
                key={index}
              >
                <h3 className='text-grey-700 text-[16px] font-medium'>
                  {card.title}
                </h3>
                <p className='text-[32px] font-semibold text-dark-100'>
                  {card.value}
                </p>
                {card.percentage && (
                  <div className='text-sm text-grey-700 flex gap-1 items-center'>
                    <p className='text-green-700 text-[14px] font-bold'>
                      {card.percentage}{" "}
                    </p>
                    <Image
                      src='/grow.svg'
                      width={8.781076431274414}
                      height={5.05718994140625}
                      alt='Image'
                      className='mt-[4px]'
                    />
                    <p className='text-[14px] text-light-grey font-medium'>
                      {card.grow}
                    </p>
                  </div>
                )}
                <Image
                  src={card.image}
                  width={36}
                  height={36}
                  alt='Image'
                  className='absolute top-[15px] right-[15px]'
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Card;
