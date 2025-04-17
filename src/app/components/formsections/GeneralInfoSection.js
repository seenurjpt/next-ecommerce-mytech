'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import FormInput from './FormInput';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

import 'react-quill-new/dist/quill.snow.css';
import Loader from '../Loader';
const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  let newObj = JSON.parse(JSON.stringify(obj || {}));
  let current = newObj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  if (keys.length > 0) {
    current[keys[keys.length - 1]] = value;
  }
  return newObj;
};

const GeneralInfoSection = ({ formData, setFormData, handleChange }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDescriptionChange = (content) => {
    setFormData((prevData) =>
      setNestedValue(prevData, 'product.description', content)
    );
  };

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean'],
      ],
    }),
    []
  );

  const quillFormats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'link',
      'color',
      'background',
      'align',
    ],
    []
  );

  return (
    <div className='bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200 space-y-4'>
      <h2 className='text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4'>
        General Information
      </h2>

      <FormInput
        label='Product Name'
        id='productName'
        name='product.name'
        value={formData?.product?.name || ''}
        onChange={handleChange}
        placeholder='Enter product name (e.g., Smartwatch E2)'
        required
      />

      <div>
        <label
          htmlFor='productDescription'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Description
        </label>
        <div
          id='productDescription'
          className='quill-editor-container mt-1'
          style={{ height: '240px' }}
        >
          {isClient && (
            <ReactQuill
              theme='snow'
              value={formData?.product?.description || ''}
              onChange={handleDescriptionChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder='Enter a detailed description...'
              style={{ height: '200px' }}
            />
          )}
          {!isClient && (
            <div style={{ height: '200px', padding: '15px' }}>
              <Loader/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
