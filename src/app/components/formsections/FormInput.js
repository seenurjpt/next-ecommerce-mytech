import React from 'react';

const FormInput = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon,
  step,
  min,
  max,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <div className='relative rounded-md shadow-sm'>
        {icon && (
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <span className='text-gray-500 sm:text-sm'>{icon}</span>
          </div>
        )}
        <input
          type={type}
          name={name}
          id={id}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          className={`block w-full ${
            icon ? 'pl-10' : 'pl-3'
          } pr-3 py-2 border border-[#858D9D] rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default FormInput;
