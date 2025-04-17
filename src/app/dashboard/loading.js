import React from "react";
import Loader from "../components/Loader";

const loading = () => {
  return (
    <div className="flex justify-center items-cente h-full w-full">
      <Loader />
    </div>
  );
};

export default loading;
