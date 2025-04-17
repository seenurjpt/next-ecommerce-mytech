import React from "react";
import FormInput from "./FormInput";

const PricingSection = ({ formData, handleChange }) => {
  return (
    <div className='bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4'>
      <h2 className='text-lg font-semibold text-gray-800'>Pricing</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormInput
          label='Base Price'
          id='price'
          name='total'
          type='number'
          value={formData.total}
          onChange={handleChange}
          placeholder='0.00'
          required
          icon='$'
          step='0.01'
          min='0'
        />
        <div>
          <label
            htmlFor='discountType'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Discount Type
          </label>
          <select
            id='discountType'
            name='pricing.discountType'
            value={formData.pricing?.discountType || "No Discount"}
            onChange={handleChange}
            className='mt-1 block w-full pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
          >
            <option>No Discount</option>
            <option>Percentage</option>
            <option>Fixed Amount</option>
          </select>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormInput
          label='Discount Percentage (%)'
          id='discountPercentage'
          name='pricing.discountPercentage'
          type='number'
          value={formData.pricing?.discountPercentage}
          onChange={handleChange}
          placeholder='0'
          icon='%'
          min='0'
          max='100'
          disabled={formData.pricing?.discountType !== "Percentage"}
        />
        <FormInput
          label='Discount Amount ($)'
          id='discountAmount'
          name='pricing.discountAmount'
          type='number'
          value={formData.pricing?.discountAmount}
          onChange={handleChange}
          placeholder='0.00'
          icon='$'
          step='0.01'
          min='0'
          disabled={formData.pricing?.discountType !== "Fixed Amount"}
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='taxClass'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Tax Class
          </label>
          <select
            id='taxClass'
            name='pricing.taxClass'
            value={formData.pricing?.taxClass || "Tax Free"}
            onChange={handleChange}
            className='mt-1 block w-full pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
          >
            <option>Tax Free</option>
            <option>Standard Tax</option>
          </select>
        </div>
        <FormInput
          label='VAT Amount (%)'
          id='vatAmount'
          name='pricing.vatAmount'
          type='number'
          value={formData.pricing?.vatAmount}
          onChange={handleChange}
          placeholder='0'
          icon='%'
          min='0'
          max='100'
          disabled={formData.pricing?.taxClass === "Tax Free"}
        />
      </div>
    </div>
  );
};

export default PricingSection;
