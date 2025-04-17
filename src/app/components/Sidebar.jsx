"use client";

import { usePathname } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { navItems } from "../utils";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathName = usePathname();
  console.log("sidebarOpen", sidebarOpen);

  const [eCommerceOpen, setECommerceOpen] = useState(false);

  const toggleECommerce = () => {
    setECommerceOpen(!eCommerceOpen);
  };

  const isActive = (route) =>
    pathName === route
      ? "bg-blue-100 text-blue-700"
      : "text-gray-700 hover:text-blue-700";

  const NavItem = ({ icon, label, route, onClick }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 cursor-pointer p-2 rounded-md ${isActive(
        route
      )} transition-all`}
    >
      {icon && icon}
      <span className="text-sm font-medium">
        {route === "/e-commerce" ? (
          <>{label} </>
        ) : (
          <Link href={route}>{label}</Link>
        )}
      </span>
      {label === "E-Commerce" && (
        <div className="ml-auto">
          {!eCommerceOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.81051 9.75H16.1895C16.3378 9.75003 16.4828 9.79404 16.6061 9.87645C16.7294 9.95886 16.8255 10.076 16.8823 10.213C16.939 10.35 16.9539 10.5008 16.9249 10.6463C16.896 10.7917 16.8246 10.9254 16.7198 11.0302L12.5303 15.2197C12.3896 15.3603 12.1989 15.4393 12 15.4393C11.8011 15.4393 11.6104 15.3603 11.4698 15.2197L7.28026 11.0302C7.1754 10.9254 7.104 10.7917 7.07507 10.6463C7.04615 10.5008 7.061 10.35 7.11775 10.213C7.1745 10.076 7.27061 9.95886 7.39392 9.87645C7.51722 9.79404 7.6622 9.75003 7.81051 9.75Z"
                fill="#858D9D"
              />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.81052 11.6896H13.1895C13.3378 11.6895 13.4828 11.6455 13.6061 11.5631C13.7294 11.4807 13.8255 11.3636 13.8823 11.2266C13.939 11.0895 13.9539 10.9388 13.925 10.7933C13.896 10.6478 13.8246 10.5142 13.7198 10.4093L9.53027 6.21983C9.38963 6.07923 9.1989 6.00024 9.00002 6.00024C8.80115 6.00024 8.61042 6.07923 8.46977 6.21983L4.28027 10.4093C4.17542 10.5142 4.10401 10.6478 4.07509 10.7933C4.04616 10.9388 4.06101 11.0895 4.11777 11.2266C4.17452 11.3636 4.27062 11.4807 4.39393 11.5631C4.51724 11.6455 4.66221 11.6895 4.81052 11.6896Z"
                fill="#2086BF"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-dark-800 bg-opacity-40 z-40 md:hidden" />
      )}
      <div
        id="sidebar-panel"
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white p-6 shadow transform transition-transform duration-300 ease-in-out
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:z-10`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 items-center">
            <Image
              src="/logo.svg"
              width={30}
              height={30}
              alt="avatar"
              className="object-cover"
            />
            <div className="text-xl font-bold">Mytech</div>
          </div>
          <FaTimes
            className="md:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        <nav className="flex flex-col gap-5 sidebar-main hide-scrollbar">
          {navItems.map((item, index) => (
            <div key={index}>
              <NavItem
                icon={item.icon}
                label={item.label}
                route={item.route}
                onClick={() => {
                  if (item.route === "/e-commerce") {
                    toggleECommerce();
                  }
                }}
              />
              {item.subItems && (
                <div className={`${eCommerceOpen ? "block" : "hidden"} pl-6`}>
                  {item.subItems.map((subItem, subIndex) => (
                    <NavItem
                      key={subIndex}
                      label={subItem.label}
                      route={subItem.route}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
