"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProductForm from "@/app/components/productlist/ProductForm";
import { toast } from "react-toastify";
import { IoMdArrowDropright } from "react-icons/io";

const AddProductPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    product: { name: "", description: "", variants: "", image: null },
    sku: "",
    category: "",
    stock: 0,
    total: 0.0,
    status: "Draft",
    addedDate: new Date().toISOString().split("T")[0],
    pricing: {
      discountType: "No Discount",
      discountPercentage: 0,
      discountAmount: 0,
      taxClass: "Tax Free",
      vatAmount: 0,
    },
    inventory: { barcode: "" },
    variations: [],
    shipping: {
      isPhysical: true,
      weight: "",
      height: "",
      length: "",
      width: "",
    },
    sidebar: { tags: [] },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSubmit = async (event) => {
    if (event) event.preventDefault();
    setIsSaving(true);
    setError(null);

    console.log("Submitting New Product Data:", formData);

    try {
      const response = await axios.post("/api/products", formData);
      console.log("API Add Response:", response.data);
      toast.success("Product added successfully!");

      setTimeout(() => {
        router.push("/e-commerce/product");
      }, 1000);
    } catch (err) {
      console.error("Error adding product:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to add product. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/e-commerce/product");
  };

  return (
    <div className='p-4 md:p-6 bg-gray-100 min-h-screen'>
      <div className='mb-6'>
        <h1 className='text-md md:text-2xl font-bold text-dark-100 mb-1'>
          Add New Product
        </h1>
        <p className='text-sm text-gray-500 flex items-center'>
          <a href='/dashboard' className='text-blue-700 hover:underline'>
            Dashboard
          </a>
          <span className='mx-1 text-gray-400'>
            <IoMdArrowDropright />
          </span>
          <a
            href='/e-commerce/product'
            className='text-blue-700 hover:underline'
          >
            Product List
          </a>
          <span className='mx-1 text-gray-400'>
            <IoMdArrowDropright />
          </span>
          <span className='text-gray-700'>Add Product</span>
        </p>
      </div>

      <ProductForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleAddSubmit}
        handleCancel={handleCancel}
        isSaving={isSaving}
        formType='Add'
      />

      {error && (
        <p className='text-red-500 text-sm mt-4 text-center'>{error}</p>
      )}
    </div>
  );
};

export default AddProductPage;
