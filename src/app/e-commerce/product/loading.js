import Loader from "@/app/components/Loader";
import React from "react";

const loading = () => {
  return (
    <div className="flex justify-center items-cente h-full w-full">
      <Loader />
    </div>
  );
};

export default loading;
