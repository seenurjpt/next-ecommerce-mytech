import React from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import GeneralInfoSection from "../formsections/GeneralInfoSection";
import MediaSection from "../formsections/MediaSection";
import PricingSection from "../formsections/PricingSection";
import InventorySection from "../formsections/InventorySection";
import VariationSection from "../formsections/VariationSection";
import ShippingSection from "../formsections/ShippingSection";
import CategoryStatusSidebar from "../formsections/CategoryStatusSidebar";

export const setNestedValue = (obj, path, value) => {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return { ...obj };
};

const ProductForm = ({
  formData,
  setFormData,
  handleSubmit,
  handleCancel,
  isSaving,
  formType = "Add",
}) => {
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let newValue;

    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      if (value === "") {
        newValue = null;
      } else {
        const parsedValue = parseFloat(value);
        newValue = isNaN(parsedValue) ? null : parsedValue;
      }
    } else {
      newValue = value;
    }

    console.log(
      `Updating state: name=${name}, value=${newValue}, typeof=${typeof newValue}`
    );

    setFormData((prevData) => setNestedValue(prevData, name, newValue));
  };

  const handleFileChange = (event) => {
    console.log("Files selected:", event.target.files);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='flex justify-end gap-3 mb-6'>
        <button
          type='button'
          onClick={handleCancel}
          disabled={isSaving}
          className='px-4 py-2 border border-[#858D9D] rounded-md text-sm font-medium text-gray-700  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
        >
          <FaTimes className='inline mr-1 h-4 w-4' /> Cancel
        </button>
        <button
          type='submit'
          disabled={isSaving}
          className='inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
        >
          <FaSave className='inline mr-1 h-4 w-4' />{" "}
          {isSaving
            ? "Saving..."
            : formType === "Edit"
            ? "Save Changes"
            : "Add Product"}
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <GeneralInfoSection
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
          />
          <MediaSection
            formData={formData}
            handleFileChange={handleFileChange}
          />
          <PricingSection formData={formData} handleChange={handleChange} />
          <InventorySection formData={formData} handleChange={handleChange} />
          <VariationSection formData={formData} setFormData={setFormData} />
          <ShippingSection formData={formData} handleChange={handleChange} />
        </div>

        <div className='lg:col-span-1 space-y-6'>
          <CategoryStatusSidebar
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
          />
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
