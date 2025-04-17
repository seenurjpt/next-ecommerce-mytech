"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { restrictedPaths } from "./utils";
import "react-toastify/dist/ReactToastify.css";

export default function WrapperComp({ children }) {
  const pathName = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (pathName === "/") {
      router.push("/dashboard");
    }
    if (restrictedPaths.includes(pathName)) {
      router.push("/not-found");
    }
  }, []);

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className='p-4 overflow-y-auto flex-1'>{children}</main>
      </div>
    </div>
  );
}
