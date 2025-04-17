import React from 'react';
import FormInput from './FormInput';

const ShippingSection = ({ formData, handleChange }) => {
  const isPhysical = formData.shipping?.isPhysical ?? true;

  return (
    <div className='bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4'>
      <h2 className='text-lg font-semibold text-gray-800'>Shipping</h2>
      <div className='flex items-start'>
        <div className='flex items-center h-5'>
          <input
            id='isPhysical'
            name='shipping.isPhysical'
            type='checkbox'
            checked={isPhysical}
            onChange={handleChange}
            className='focus:ring-blue-500 h-4 w-4 text-blue-700 border-[#858D9D] rounded'
          />
        </div>
        <div className='ml-3 text-sm'>
          <label htmlFor='isPhysical' className='font-medium text-gray-700'>
            This is a physical product
          </label>
          <p className='text-gray-500 text-xs'>Requires shipping address.</p>
        </div>
      </div>

      {isPhysical && (
        <div className='border-t pt-4 mt-4'>
          <p className='text-sm font-medium text-gray-600 mb-2'>
            Weight & Dimensions
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
            <FormInput
              label='Weight (kg)'
              id='weight'
              name='shipping.weight'
              type='number'
              value={formData.shipping?.weight}
              onChange={handleChange}
              placeholder='0.00'
              step='0.01'
              min='0'
            />
            <FormInput
              label='Height (cm)'
              id='height'
              name='shipping.height'
              type='number'
              value={formData.shipping?.height}
              onChange={handleChange}
              placeholder='0'
              min='0'
            />
            <FormInput
              label='Length (cm)'
              id='length'
              name='shipping.length'
              type='number'
              value={formData.shipping?.length}
              onChange={handleChange}
              placeholder='0'
              min='0'
            />
            <FormInput
              label='Width (cm)'
              id='width'
              name='shipping.width'
              type='number'
              value={formData.shipping?.width}
              onChange={handleChange}
              placeholder='0'
              min='0'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingSection;
