"use client";

import {
  FaSearch,
  FaCalendarAlt,
  FaBell,
  FaEnvelope,
  FaBars,
} from "react-icons/fa";
import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";

const Navbar = ({ toggleSidebar }) => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    axios.get("/data/userData.json").then((response) => {
      const user = response?.data?.userData ?? {};
      setUserData(user);
      sessionStorage.setItem("userData", JSON.stringify(user));
    });
  }, []);

  return (
    <header className='bg-white px-4 py-3 shadow flex justify-between items-center flex-wrap md:flex-nowrap gap-4'>
      {/* Left: Hamburger + Search */}
      <div className='flex items-center gap-1 flex-1 min-w-[200px]'>
        {/* Hamburger for Mobile */}
        <button className='md:hidden' onClick={toggleSidebar}>
          <FaBars className='text-gray-600 text-xl' />
        </button>

        {/* Search */}
        <div className='flex items-center bg-white-100 rounded px-2 flex-1 max-w-[250px] sm:max-w-[300px] md:max-w-[350px]'>
          <FaSearch className='text-gray-500' />
          <input
            type='text'
            placeholder='Search'
            className='bg-transparent outline-none px-2 py-1 text-sm w-full'
          />
        </div>
      </div>

      {/* Right: Icons + Profile */}
      <div className='flex items-center md:gap-4 gap-10 ml-7 md:ml-0 flex-wrap justify-end flex-shrink-0 profile-group'>
        <FaCalendarAlt className='text-gray-600 cursor-pointer text-lg' />
        <div className='relative'>
          <FaBell className='text-gray-600 cursor-pointer text-lg' />
          <span className='absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center'>
            2
          </span>
        </div>
        <div className='relative'>
          <FaEnvelope className='text-gray-600 cursor-pointer text-lg' />
          <span className='absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center'>
            2
          </span>
        </div>

        {/* Profile Popover */}
        <Popover className='relative'>
          {({ open }) => (
            <>
              <PopoverButton className='focus:outline-none'>
                <div className='flex items-center gap-2 cursor-pointer'>
                  <div className='relative'>
                    <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden'>
                      <span className='text-white text-sm'>
                        {userData?.profile ? (
                          <Image
                            src={`/${userData?.profile}`}
                            width={40}
                            height={40}
                            alt='avatar'
                            className='object-cover w-full h-full'
                          />
                        ) : (
                          <>
                            {userData?.firstName?.charAt(0).toUpperCase()}
                            {userData?.lastName?.charAt(0).toUpperCase()}
                          </>
                        )}
                      </span>
                    </div>
                    <span className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white'></span>
                  </div>

                  <div className='hidden sm:flex flex-col items-start'>
                    <span className='text-sm font-medium whitespace-nowrap'>{`${
                      userData?.firstName ?? ''
                    } ${userData?.lastName ?? ''}`}</span>
                    <span className='text-xs text-gray-500 whitespace-nowrap'>
                      {userData?.role ?? ''}
                    </span>
                  </div>
                </div>
              </PopoverButton>

              <Transition
                as={Fragment}
                enter='transition ease-out duration-200'
                enterFrom='opacity-0 translate-y-0'
                enterTo='opacity-100 translate-y-1'
                leave='transition ease-in duration-150'
                leaveFrom='opacity-100 translate-y-1'
                leaveTo='opacity-0 translate-y-0'
              >
                <PopoverPanel className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-md rounded-lg z-50'>
                  <div className='p-2'>
                    <button className='w-full text-left text-gray-700 py-2 px-4 hover:bg-blue-100'>
                      Settings
                    </button>
                    <button className='w-full text-left text-gray-700 py-2 px-4 hover:bg-blue-100'>
                      Sign Out
                    </button>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </header>
  );
};

export default Navbar;
