import React, { useState, useEffect, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import Loader from "./Loader";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MemoizedGeography = memo(({ geo, geographyProps }) => {
  return <Geography geography={geo} {...geographyProps} />;
});
MemoizedGeography.displayName = "MemoizedGeography";

const CustomerGrowth = () => {
  const [countryData, setCountryData] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/dashboard/customer-growth")
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setCountryData(data);
          setIsLoading(false);
        } else {
          console.error("Fetched data is not an array:", data);
          setCountryData([]);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching customer growth data:", error);
        setCountryData([]);
      });
  }, []);

  const handleMouseEnter = (geo) => {
    const currentCountryData = countryData.find(
      (c) => c.id === geo.properties.ISO_A3
    );

    setHoveredCountry({
      id: geo.properties.ISO_A3,
      name: geo.properties.NAME,
      ...(currentCountryData && {
        customerCount: currentCountryData.customerCount,
        growth: currentCountryData.growth,
      }),
    });
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
  };

  return (
    <div className='bg-white p-4 md:p-6 rounded-lg shadow-lg w-full lg:w-[35%]'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='text-lg md:text-xl text-dark-100 font-bold'>
            Customer Growth
          </h3>
          <p className='text-sm text-grey-700'>Based on Country</p>
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
        <>
          <div
            className='relative mb-6 h-60 md:h-[160px] border border-gray-200 rounded'
            onMouseLeave={handleMouseLeave}
          >
            <ComposableMap
              projection='geoMercator'
              style={{ width: "100%", height: "100%" }}
              projectionConfig={{ scale: 80, center: [0, 20] }}
            >
              <ZoomableGroup zoom={1} center={[0, 20]}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const isHovered =
                        hoveredCountry &&
                        hoveredCountry.id === geo.properties.ISO_A3;
                      const geographyProps = {
                        style: {
                          default: {
                            fill: isHovered ? "#3b82f6" : "#E9EEF4",
                            outline: "none",
                            stroke: "#FFFFFF",
                            strokeWidth: 0.5,
                          },
                          hover: {
                            fill: isHovered ? "#3b82f6" : "#d1d5db",
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#2563eb",
                            outline: "none",
                          },
                        },
                        onMouseEnter: () => handleMouseEnter(geo),
                      };

                      return (
                        <MemoizedGeography
                          key={geo.rsmKey}
                          geo={geo}
                          geographyProps={geographyProps}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {hoveredCountry && (
              <div className='absolute top-4 right-4 bg-gray-800 bg-opacity-90 text-white p-3 rounded-lg shadow-md text-xs pointer-events-none transition-opacity duration-150'>
                <p className='font-semibold mb-1'>{hoveredCountry.name}</p>
                {hoveredCountry.customerCount !== undefined &&
                hoveredCountry.growth !== undefined ? (
                  <>
                    <p>
                      Cust:{" "}
                      <span className='font-medium'>
                        {hoveredCountry.customerCount.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Growth:{" "}
                      <span className='font-medium'>
                        {hoveredCountry.growth}%
                      </span>
                    </p>
                  </>
                ) : (
                  <p className='text-gray-300 italic'>No data available</p>
                )}
              </div>
            )}
          </div>

          <div className='space-y-3 overflow-y-auto max-h-90 pr-2 hide-scrollbar'>
            {countryData.length === 0 && (
              <p className='text-sm text-grey-700 text-center py-4'>
                <Loader />
              </p>
            )}
            {countryData.map((country) => (
              <div key={country.id} className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-gray-200 flex-shrink-0'></div>
                <div className='flex-grow'>
                  <p className='text-sm font-medium text-gray-800'>
                    {country.name}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {country.customerCount.toLocaleString()} Customers
                  </p>
                </div>
                <div className='flex items-center gap-2 w-2/5'>
                  <div className='w-full bg-gray-200 rounded-full h-1.5 md:h-2 flex-grow'>
                    <div
                      className='h-full rounded-full'
                      style={{
                        width: `${country.percentage}%`,
                        backgroundColor: country.color || "#6b7280",
                      }}
                    ></div>
                  </div>
                  <span className='text-xs font-medium text-gray-600 w-8 text-right'>
                    {country.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerGrowth;
