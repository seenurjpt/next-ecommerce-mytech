import React from "react";

const Loader = () => {
  return (
    <div className='flex justify-center items-center'>
      <div
        className='w-12 h-12 rounded-full animate-spin
                    border-2 border-solid border-[#2086bfd9] border-t-transparent'
      ></div>{" "}
    </div>
  );
};

export default Loader;
