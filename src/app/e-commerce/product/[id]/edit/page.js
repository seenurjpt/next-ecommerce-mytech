"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/app/components/productlist/ProductForm";
import { toast } from "react-toastify";
import { IoMdArrowDropright } from "react-icons/io";
import Loader from "@/app/components/Loader";

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(null);
    setError(null);
    setLoading(true);

    if (!productId) {
      const msg = "Product ID not found in URL.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        const foundProduct = response.data;
        const initialFormData = {
          ...foundProduct,
          product: foundProduct.product || {},
          pricing: foundProduct.pricing || {
            price: foundProduct.total ?? 0.0,
            discountType: "No Discount",
            discountPercentage: 0,
            discountAmount: 0,
            taxClass: "Tax Free",
            vatAmount: 0,
          },
          inventory: foundProduct.inventory || {
            sku: "",
            barcode: "",
            quantity: 0,
            allowBackorder: false,
          },
          variations: foundProduct.variations || [],
          shipping: foundProduct.shipping || {
            isPhysical: true,
            weight: "",
            height: "",
            length: "",
            width: "",
          },
          media: foundProduct.media || { images: [] },
          sidebar: foundProduct.sidebar || {
            status: "Draft",
            visibility: "Published",
            category: "",
            tags: [],
          },
          sku: foundProduct.sku || "",
          category: foundProduct.category || "",
          stock: foundProduct.stock || 0,
          total: foundProduct.total || 0.0,
          status: foundProduct.status || "Draft",
          addedDate:
            foundProduct.addedDate || new Date().toISOString().split("T")[0],
        };

        if (
          initialFormData.pricing &&
          typeof initialFormData.total !== "undefined" &&
          initialFormData.pricing.price !== initialFormData.total
        ) {
          initialFormData.pricing.price = initialFormData.total;
        }

        setFormData(foundProduct);
      } catch (err) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateSubmit = async (event) => {
    if (event) event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await axios.put(`/api/products/${productId}`, formData);
      toast.success("Product updated successfully!");
      setTimeout(() => {
        router.push("/e-commerce/product");
      }, 1000);
    } catch (err) {
      const errorMsg = "Failed to update product. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/e-commerce/product");
  };

  if (loading)
    return (
      <div className='p-6 text-center text-gray-500'>
        <Loader />
      </div>
    );
  if (error)
    return <div className='p-6 text-center text-red-500'>Error: {error}</div>;
  if (!formData)
    return (
      <div className='p-6 text-center text-gray-500'>
        Product data could not be loaded.
      </div>
    );

  return (
    <div className='p-4 md:p-6 bg-gray-100 min-h-screen'>
      <div className='mb-6'>
        <h1 className='text-md md:text-2xl font-bold text-dark-100 mb-1'>
          Edit Product
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
          <span className='mx-1 text-gray-400'>{">"}</span>
          <span className='text-gray-700'>Edit Product</span>
        </p>
      </div>

      <ProductForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleUpdateSubmit}
        handleCancel={handleCancel}
        isSaving={isSaving}
        formType='Edit'
      />

      {error && (
        <p className='text-red-500 text-sm mt-4 text-center'>{error}</p>
      )}
    </div>
  );
};

export default EditProductPage;
