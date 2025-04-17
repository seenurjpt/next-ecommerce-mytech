import React from 'react';
import FormInput from './FormInput';

const InventorySection = ({ formData, handleChange }) => {
  return (
    <div className='bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4'>
      <h2 className='text-lg font-semibold text-gray-800'>Inventory</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FormInput
          label='SKU'
          id='sku'
          name='sku'
          value={formData.sku}
          onChange={handleChange}
          placeholder='e.g., SKU12345'
          required
        />
        <FormInput
          label='Barcode (ISBN, UPC, GTIN, etc.)'
          id='barcode'
          name='inventory.barcode'
          value={formData.inventory?.barcode}
          onChange={handleChange}
          placeholder='e.g., 098493901123'
        />
        <FormInput
          label='Quantity'
          id='stock'
          name='stock'
          type='number'
          value={formData.stock}
          onChange={handleChange}
          placeholder='0'
          required
          min='0'
        />
      </div>
    </div>
  );
};

export default InventorySection;
