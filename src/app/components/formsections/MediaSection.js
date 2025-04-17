import React from 'react';
import { FaImage, FaPlus } from 'react-icons/fa';

const MediaSection = ({ formData, handleFileChange }) => {
  const existingImages = formData?.product?.images || [];

  return (
    <div className='bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4'>
      <h2 className='text-lg font-semibold text-gray-800 mb-2'>Media</h2>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Photos
        </label>
        <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#858D9D] border-dashed rounded-md'>
          <div className='space-y-1 text-center'>
            <FaImage className='mx-auto h-12 w-12 text-gray-400' />
            <div className='flex text-sm text-gray-600'>
              <label
                htmlFor='file-upload'
                className='relative cursor-pointer bg-white rounded-md font-medium text-blue-700 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500'
              >
                <span>Upload a file</span>
                <input
                  id='file-upload'
                  name='files'
                  type='file'
                  className='sr-only'
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              <p className='pl-1'>or drag and drop</p>
            </div>
            <p className='text-xs text-gray-500'>PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {existingImages.length > 0 && (
          <div className='mt-4 grid grid-cols-3 gap-4'>
            {existingImages.map((imgSrc, index) => (
              <div key={index} className='relative'>
                <img
                  src={imgSrc}
                  alt={`Product ${index + 1}`}
                  className='h-24 w-full object-cover rounded-md border border-gray-200'
                />
                <button
                  type='button'
                  className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 text-xs'
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
        <div className='mt-4'>
          <button
            type='button'
            onClick={() => document.getElementById('file-upload')?.click()}
            className='inline-flex items-center px-3 py-2 border border-[#858D9D] shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            <FaPlus className='-ml-0.5 mr-2 h-4 w-4' aria-hidden='true' />
            Add Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaSection;
