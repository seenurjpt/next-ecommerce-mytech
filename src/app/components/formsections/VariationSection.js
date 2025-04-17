import React from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import Select from "react-select";

const getVariations = (formData) => formData?.variations || [];

const VariationSection = ({ formData, setFormData }) => {
  const variations = getVariations(formData);

  const handleAddVariation = () => {
    setFormData((prevData) => {
      const currentVariations = getVariations(prevData);
      const newVariations = [...currentVariations, { type: "", value: "" }];
      return { ...prevData, variations: newVariations };
    });
  };

  const handleRemoveVariation = (indexToRemove) => {
    setFormData((prevData) => {
      const currentVariations = getVariations(prevData);
      const newVariations = currentVariations.filter(
        (_, i) => i !== indexToRemove
      );
      return { ...prevData, variations: newVariations };
    });
  };

  const handleVariationChange = (indexToUpdate, field, value) => {
    setFormData((prevData) => {
      const currentVariations = getVariations(prevData);
      const newVariations = currentVariations.map((variation, i) => {
        if (i === indexToUpdate) {
          return { ...variation, [field]: value };
        }
        return variation;
      });
      return { ...prevData, variations: newVariations };
    });
  };

  const variationTypeOptions = [
    { value: "Color", label: "Color" },
    { value: "Size", label: "Size" },
    { value: "Material", label: "Material" },
  ];

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "38px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
      fontSize: "0.875rem",
      borderRadius: "0.375rem",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      paddingTop: "0px",
      paddingBottom: "0px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : null,
      color: state.isSelected ? "white" : "#1f2937",
    }),
  };

  return (
    <div className='bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200 space-y-4'>
      <h2 className='text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4'>
        Variation
      </h2>

      {variations.length > 0 ? (
        variations.map((variation, index) => (
          <div
            key={index}
            className='grid grid-cols-1 md:grid-cols-8 gap-3 items-end border-b border-[#858D9D] pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0'
          >
            <div className='md:col-span-3'>
              <label
                htmlFor={`variationType-${index}`}
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Variation Type
              </label>
              <Select
                id={`variationType-${index}`}
                name={`variations[${index}].type`}
                options={variationTypeOptions}
                styles={selectStyles}
                value={variationTypeOptions.find(
                  (opt) => opt.value === variation.type
                )}
                onChange={(selectedOption) =>
                  handleVariationChange(
                    index,
                    "type",
                    selectedOption ? selectedOption.value : ""
                  )
                }
                placeholder='Select Type...'
                classNamePrefix='react-select'
              />
            </div>
            <div className='md:col-span-4'>
              <label
                htmlFor={`variationValue-${index}`}
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Variation
              </label>
              <input
                type='text'
                id={`variationValue-${index}`}
                name={`variations[${index}].value`}
                value={variation.value || ""}
                onChange={(e) =>
                  handleVariationChange(index, "value", e.target.value)
                }
                placeholder='e.g., Black, Large, Cotton'
                className='block w-full px-3 py-2 border border-[#858D9D] rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500' // Added shadow-sm for consistency
              />
            </div>
            <div className='md:col-span-1 flex justify-start pt-2 md:pt-0'>
              {" "}
              <button
                type='button'
                onClick={() => handleRemoveVariation(index)}
                className='p-2 text-red-500 bg-red-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500' // Enhanced styling
                title='Remove Variation'
              >
                <FaTrashAlt className='w-4 h-4' />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className='text-sm text-gray-500'>No variations added yet.</p>
      )}

      <div className='pt-4'>
        {" "}
        <button
          type='button'
          onClick={handleAddVariation}
          className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-90 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          <FaPlus className='-ml-1 mr-2 h-5 w-5' aria-hidden='true' />
          Add Variant
        </button>
      </div>
    </div>
  );
};

export default VariationSection;
