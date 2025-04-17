import React from 'react';
import Select from 'react-select';

const StatusBadgeDisplay = ({ value }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  switch (value?.toLowerCase()) {
    case 'published':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case 'draft':
      bgColor = 'bg-gray-200';
      textColor = 'text-gray-600';
      break;
    case 'low stock':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-600';
      break;
    case 'out of stock':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
  }
  return (
    <span
      className={`inline-block ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {value || 'N/A'}
    </span>
  );
};

const CategoryStatusSidebar = ({ formData, handleChange }) => {
  const categoryOptions = [
    { value: 'Watch', label: 'Watch' },
    { value: 'Bag & Pouch', label: 'Bag & Pouch' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Smartphone', label: 'Smartphone' },
    { value: 'Shoes', label: 'Shoes' },
    { value: 'Mouse', label: 'Mouse' },
    { value: 'Toys', label: 'Toys' },
    { value: 'Beauty', label: 'Beauty' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Home Goods', label: 'Home Goods' },
    { value: 'Camera', label: 'Camera' },
  ];

  const tagOptions = [
    { value: 'gadget', label: 'Gadget' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'wearable', label: 'Wearable' },
    { value: 'new', label: 'New Arrival' },
    { value: 'sale', label: 'On Sale' },
  ];

  const statusOptions = [
    { value: 'Published', label: 'Published' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Low Stock', label: 'Low Stock' },
    { value: 'Out of Stock', label: 'Out of Stock' },
  ];

  const handleTagChange = (selectedOptions) => {
    const tagValues = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    handleChange({ target: { name: 'sidebar.tags', value: tagValues } });
  };

  const selectedTagValues = formData.sidebar?.tags || [];
  const selectedTagOptions = tagOptions.filter((opt) =>
    selectedTagValues.includes(opt.value)
  );

  return (
    <div className='space-y-6'>
      {/* Category Section */}
      <div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
        <h3 className='text-base font-semibold text-gray-800 mb-3'>Category</h3>
        <label htmlFor='category' className='sr-only'>
          Product Category
        </label>
        <select
          id='category'
          name='category'
          value={formData.category || ''}
          onChange={handleChange}
          className='mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
        >
          <option value='' disabled>
            Select Category
          </option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Section */}
      <div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
        <h3 className='text-base font-semibold text-gray-800 mb-3'>
          Product Tags
        </h3>
        <label htmlFor='productTags' className='sr-only'>
          Product Tags
        </label>
        <Select
          id='productTags'
          instanceId='productTagsSelect'
          isMulti
          name='sidebar.tags'
          options={tagOptions}
          className='basic-multi-select text-sm'
          classNamePrefix='react-select'
          value={selectedTagOptions}
          onChange={handleTagChange}
          placeholder='Select tags...'
        />
      </div>

      {/* Status Section */}
      <div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-base font-semibold text-gray-800'>Status</h3>
          <StatusBadgeDisplay value={formData.status} />
        </div>
        <label htmlFor='status' className='sr-only'>
          Product Status
        </label>
        <select
          id='status'
          name='status'
          value={formData.status || ''}
          onChange={handleChange}
          className='mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
        >
          <option value='' disabled>
            Select Status
          </option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CategoryStatusSidebar;
