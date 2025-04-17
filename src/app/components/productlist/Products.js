"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useTable, useSortBy, usePagination, useRowSelect } from "react-table";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import ProductTable, {
  IndeterminateCheckbox,
  StatusBadge,
  ImageWithFallback,
} from "./ProductTable";
import ProductListPagination from "./ProductListPagination";
import {
  FaDownload,
  FaPlus,
  FaSearch,
  FaFilter,
  FaPen,
  FaExclamationTriangle,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { IoMdArrowDropright } from "react-icons/io";
import Loader from "../Loader";
import ReactSlider from "react-slider";
import useDebounce from "@/app/hooks/useDebounce";

const Products = () => {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("All Product");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [productNameToDelete, setProductNameToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [productToView, setProductToView] = useState(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const [filterSortOrder, setFilterSortOrder] = useState("");
  const [maxPriceLimit, setMaxPriceLimit] = useState(1000);
  const [filterPriceRange, setFilterPriceRange] = useState([0, 1000]);
  const [filterPriceCondition, setFilterPriceCondition] = useState("eq");
  const [columnSearchTerm, setColumnSearchTerm] = useState("");
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const columnButtonRef = useRef(null);
  const columnPanelRef = useRef(null);
  const debouncedFilterPriceRange = useDebounce(filterPriceRange, 300);
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/products");
      if (Array.isArray(response.data)) {
        const dataWithIds = response.data.map((item, i) => ({
          ...item,
          id: item.id || item._id || `prod-${Date.now()}-${i}`,
          product: item.product || {
            name: item.name,
            image: item.image,
            variants: item.variantsCount,
          },
          inventory: item.inventory || { sku: item.sku, quantity: item.stock },
          sidebar: item.sidebar || {
            category: item.category,
            status: item.status,
          },
          pricing: item.pricing || { price: item.price },
          addedDate: item.addedDate || item.createdAt,
        }));

        setAllProducts(dataWithIds);
        setFilteredProducts(dataWithIds);

        if (dataWithIds.length > 0) {
          const prices = dataWithIds
            .map((p) => p.total ?? p.pricing?.price ?? 0)
            .filter((p) => typeof p === "number");
          const max = Math.max(...prices, 0);
          const calculatedMax = Math.ceil(max / 100) * 100 || 1000;
          setMaxPriceLimit(calculatedMax);
          setFilterPriceRange([0, calculatedMax]);
        } else {
          setMaxPriceLimit(1000);
          setFilterPriceRange([0, 1000]);
        }
      } else {
        console.error("Invalid data format received:", response.data);
        throw new Error("Invalid data format received from API.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not load products.";
      setError(errorMsg);
      toast.error(`Error fetching products: ${errorMsg}`);
      console.error("Fetch Error:", err);
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!isClient) return;

    let result = allProducts;

    if (activeTab !== "All Product") {
      let statusFilterValue = activeTab.toLowerCase();
      if (activeTab === "Low Stock") statusFilterValue = "low stock";
      if (activeTab === "Out of Stock") statusFilterValue = "out of stock";
      result = result.filter(
        (p) => p.sidebar?.status?.toLowerCase() === statusFilterValue
      );
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.product?.name?.toLowerCase().includes(lowerSearch) ||
          p.inventory?.sku?.toLowerCase().includes(lowerSearch) ||
          p.sidebar?.category?.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedDate) {
      try {
        const filterDateStr = format(selectedDate, "yyyy-MM-dd");
        result = result.filter((p) => {
          if (!p.addedDate) return false;
          try {
            const itemDateStr = format(new Date(p.addedDate), "yyyy-MM-dd");
            return itemDateStr === filterDateStr;
          } catch {
            return false;
          }
        });
      } catch (e) {
        console.error("Date filtering error:", e);
      }
    }

    const [minPrice, maxPrice] = filterPriceRange;
    const priceAccessor = (p) => p.total ?? p.pricing?.price ?? null;

    result = result.filter((p) => {
      const price = priceAccessor(p);
      if (price === null || typeof price !== "number") return false;

      const hasMin = typeof minPrice === "number" && !isNaN(minPrice);
      const hasMax = typeof maxPrice === "number" && !isNaN(maxPrice);

      switch (filterPriceCondition) {
        case "eq":
          if (!hasMin || !hasMax) return false;
          return price >= minPrice && price <= maxPrice;
        case "lt":
          if (!hasMax) return false;
          return price < maxPrice;
        case "gt":
          if (!hasMin) return false;
          return price > minPrice;
        case "lte":
          if (!hasMax) return false;
          return price <= maxPrice;
        case "gte":
          if (!hasMin) return false;
          return price >= minPrice;
        default:
          return true;
      }
    });

    if (filterSortOrder) {
      const sortDesc = filterSortOrder === "desc";
      result = [...result].sort((a, b) => {
        const priceA = priceAccessor(a) ?? (sortDesc ? -Infinity : Infinity);
        const priceB = priceAccessor(b) ?? (sortDesc ? -Infinity : Infinity);
        if (priceA < priceB) return sortDesc ? 1 : -1;
        if (priceA > priceB) return sortDesc ? -1 : 1;
        return 0;
      });
    }

    setFilteredProducts(result);
  }, [
    allProducts,
    activeTab,
    searchTerm,
    selectedDate,
    debouncedFilterPriceRange,
    filterPriceCondition,
    filterSortOrder,
    isClient,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilterPopover &&
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilterPopover(false);
      }
      if (
        showColumnPopover &&
        columnPanelRef.current &&
        !columnPanelRef.current.contains(event.target) &&
        columnButtonRef.current &&
        !columnButtonRef.current.contains(event.target)
      ) {
        setShowColumnPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterPopover, showColumnPopover]);
  const columns = useMemo(
    () => [
      {
        Header: "Product",
        accessor: "product",
        Cell: ({ row }) => {
          const productInfo = row.original.product || {};
          const skuInfo = row.original.inventory?.sku || "N/A";
          const fallback = (
            <div className='w-10 h-10 rounded-md bg-gray-200 flex-shrink-0'></div>
          );
          return (
            <div className='flex items-center gap-3 min-w-[200px]'>
              <ImageWithFallback
                src={productInfo.image}
                alt={productInfo.name}
                fallback={fallback}
                imgClassName='w-10 h-10 rounded-md object-cover bg-gray-100 flex-shrink-0'
              />
              <div className='flex-grow overflow-hidden'>
                <div className='text-sm font-medium text-gray-900 truncate'>
                  {productInfo.name || "N/A"}
                </div>
                <div className='text-xs text-gray-500'>
                  {productInfo.variants && productInfo.variants > 0
                    ? `${productInfo.variants} Variant${
                        productInfo.variants > 1 ? "s" : ""
                      }`
                    : `SKU: ${skuInfo}`}
                </div>
              </div>
            </div>
          );
        },
        sortType: "alphanumericNestedName",
        minWidth: 250,
      },
      {
        Header: "SKU",
        accessor: (d) => d.inventory?.sku,
        id: "sku",
        sortType: "basic",
        width: 120,
        Cell: ({ value }) => (
          <span className='text-blue-700 font-medium text-sm'>
            {value || "N/A"}
          </span>
        ),
      },
      {
        Header: "Category",
        accessor: (d) => d.sidebar?.category,
        id: "category",
        sortType: "basic",
        width: 150,
        Cell: ({ value }) => <span className='text-sm'>{value || "N/A"}</span>,
      },
      {
        Header: "Stock",
        accessor: (d) => d.inventory?.quantity,
        id: "stock",
        sortType: "basic",
        width: 80,
        Cell: ({ value }) => (
          <div className='text-right pr-4 text-sm'>
            {typeof value === "number" ? value : "-"}
          </div>
        ),
      },
      {
        Header: "Price",
        accessor: (d) => d.total ?? d.pricing?.price,
        id: "price",
        sortType: "basic",
        width: 100,
        Cell: ({ value }) => (
          <span className='text-sm'>
            {typeof value === "number" ? `$${value.toFixed(2)}` : "N/A"}
          </span>
        ),
      },
      {
        Header: "Status",
        accessor: (d) => d.sidebar?.status,
        id: "status",
        Cell: ({ value }) => <StatusBadge value={value} />,
        disableSortBy: true,
        width: 110,
      },
      {
        Header: "Added",
        accessor: "addedDate",
        sortType: "datetime",
        width: 120,
        Cell: ({ value }) => (
          <span className='text-sm'>
            {value ? format(new Date(value), "dd MMM yyyy") : "N/A"}
          </span>
        ),
      },
      {
        Header: "Action",
        id: "action",
        disableSortBy: true,
        width: 100,
        Cell: "Actions",
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data: filteredProducts,
      initialState: { pageIndex: 0, pageSize: 10, sortBy: [] },
      manualPagination: false,
      manualSortBy: false,
      autoResetPage: true,
      autoResetSortBy: false,
      autoResetSelectedRows: false,
      sortTypes: {
        alphanumericNestedName: (rowA, rowB, columnId) => {
          const nameA = rowA.original?.[columnId]?.name?.toLowerCase() ?? "";
          const nameB = rowB.original?.[columnId]?.name?.toLowerCase() ?? "";
          return nameA.localeCompare(nameB);
        },
        basic: (rowA, rowB, columnId) => {
          const a = rowA.values[columnId];
          const b = rowB.values[columnId];
          if (a == null && b == null) return 0;
          if (a == null) return -1;
          if (b == null) return 1;
          return a === b ? 0 : a > b ? 1 : -1;
        },
        datetime: (rowA, rowB, columnId) => {
          const dateA = new Date(rowA.values[columnId] || 0);
          const dateB = new Date(rowB.values[columnId] || 0);
          const timeA = isNaN(dateA.getTime()) ? -Infinity : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? -Infinity : dateB.getTime();
          return timeA - timeB;
        },
      },
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((hookColumns) => [
        {
          id: "selection",
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <div className='flex justify-center items-center h-full px-1'>
              <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div className='flex justify-center items-center h-full px-1'>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
          disableSortBy: true,
          width: 50,
          minWidth: 50,
          maxWidth: 50,
        },
        ...hookColumns,
      ]);
    }
  );

  const {
    state: { pageIndex, pageSize },
    pageCount,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    allColumns,
    setHiddenColumns,
    setSortBy,
  } = tableInstance;

  const handleEditProduct = useCallback(
    (product) => {
      if (product && product.id) {
        router.push(`/e-commerce/product/${product.id}/edit`);
      } else {
        toast.error("Cannot edit product without a valid ID.");
      }
    },
    [router]
  );

  const handleViewProduct = useCallback((product) => {
    if (product && product.id) {
      setProductToView(product);
      setIsViewModalOpen(true);
    } else {
      console.error(
        "View action failed: Product or Product ID is missing",
        product
      );
      toast.warning("Cannot view product details.");
    }
  }, []);

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setProductToView(null);
  };

  const handleRequestDelete = (productId, productName) => {
    if (productId) {
      setProductIdToDelete(productId);
      setProductNameToDelete(productName);
      setIsConfirmModalOpen(true);
    } else {
      console.error("Delete action failed: Product ID is missing");
      toast.error("Cannot initiate delete without Product ID.");
    }
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setProductIdToDelete(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!productIdToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/products/${productIdToDelete}`);
      toast.success(`Product deleted successfully!`);
      fetchProducts();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not delete product.";
      toast.error(`Deletion failed: ${errorMsg}`);
      console.error("Delete Error:", err);
    } finally {
      handleCloseConfirmModal();
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleClearAllFilters = () => {
    setFilterSortOrder("");
    setFilterPriceRange([0, maxPriceLimit]);
    setFilterPriceCondition("eq");
    setSortBy([]);
    setSelectedDate(null);
    setSearchTerm("");
    setShowFilterPopover(false);
  };

  const handleSortChange = (event) => {
    const newSortOrder = event.target.value;
    setFilterSortOrder(newSortOrder);
  };

  const handlePriceRangeChange = (value) => {
    setFilterPriceRange(value);
  };

  const handleManualPriceInputChange = (event) => {
    const { name, value } = event.target;
    let numericValue = value === "" ? null : parseFloat(value);

    let [currentMin, currentMax] = filterPriceRange;

    currentMin = typeof currentMin === "number" ? currentMin : 0;
    currentMax = typeof currentMax === "number" ? currentMax : maxPriceLimit;

    let newMin = currentMin;
    let newMax = currentMax;

    if (name === "min") {
      newMin =
        numericValue === null || isNaN(numericValue)
          ? 0
          : Math.max(0, numericValue);
      if (newMin > newMax) {
        newMin = newMax;
      }
    } else {
      newMax =
        numericValue === null || isNaN(numericValue)
          ? maxPriceLimit
          : Math.max(0, numericValue);
      if (newMax < newMin) {
        newMax = newMin;
      }
      if (newMax > maxPriceLimit) newMax = maxPriceLimit;
    }

    setFilterPriceRange([newMin, newMax]);
  };

  const handlePriceConditionChange = (event) => {
    setFilterPriceCondition(event.target.value);
  };

  const handleColumnSearchChange = (event) => {
    setColumnSearchTerm(event.target.value);
  };

  const handleResetColumns = () => {
    const allDataColumnIds = allColumns
      .filter((col) => col.id !== "selection" && col.id !== "action")
      .map((col) => col.id);
    setHiddenColumns([]);
    setColumnSearchTerm("");
  };

  return (
    <>
      {loading && !isClient && <Loader />}

      <div
        className={`p-4 md:p-6 bg-gray-50 min-h-screen ${
          loading && !isClient ? "invisible" : "visible"
        }`}
      >
        <div className='mb-4'>
          <h1 className='text-lg md:text-2xl font-bold text-gray-800 mb-1'>
            Product
          </h1>
          <p className='text-sm text-gray-500 flex items-center'>
            <a href='/dashboard' className='text-blue-600 hover:underline'>
              Dashboard
            </a>
            <span className='mx-1 text-gray-400'>
              <IoMdArrowDropright size={18} />
            </span>
            <span className='text-gray-700'>Product List</span>
          </p>
        </div>

        <div className='flex flex-col md:flex-row justify-between items-center mb-4 gap-3'>
          <div className='flex flex-wrap items-center gap-1 border border-gray-200 p-1 rounded-lg bg-white shadow-sm w-full md:w-auto'>
            {[
              "All Product",
              "Published",
              "Low Stock",
              "Draft",
              "Out of Stock",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className='flex items-center space-x-2 w-full md:w-auto justify-end'>
            <button className='flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors'>
              <FaDownload /> Export
            </button>
            <button
              className='flex items-center gap-1.5 px-3 py-2 border border-transparent rounded-md text-xs md:text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition-colors'
              onClick={() => router.push("/e-commerce/product/add")}
            >
              <FaPlus /> Add Product
            </button>
          </div>
        </div>

        <div className='mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-center'>
            <div className='relative sm:col-span-1 md:col-span-1'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaSearch className='text-gray-400 h-4 w-4' />
              </div>
              <input
                type='search'
                placeholder='Search name, SKU, category...'
                value={searchTerm}
                onChange={handleSearchChange}
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder-gray-400'
              />
            </div>

            <div className='sm:col-span-1 md:col-span-1'>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                placeholderText='Filter by Added Date'
                className='w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder-gray-400'
                dateFormat='dd MMM yyyy'
                isClearable
                showPopperArrow={false}
              />
            </div>

            <div className='hidden md:block md:col-span-1'></div>

            <div className='sm:col-span-2 md:col-span-1 flex justify-start sm:justify-end gap-2'>
              <div className='relative' ref={filterButtonRef}>
                <button
                  onClick={() => setShowFilterPopover((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium shadow-sm transition-colors ${
                    showFilterPopover
                      ? "bg-blue-50 border-blue-300 text-blue-600 ring-1 ring-blue-300"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                  aria-expanded={showFilterPopover}
                >
                  <FaFilter /> Filters
                </button>
                {showFilterPopover && (
                  <div
                    ref={filterPanelRef}
                    className='absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-30'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className='flex justify-between items-center px-4 py-3 border-b border-gray-200'>
                      <h3 className='text-base font-semibold text-gray-800'>
                        Filter
                      </h3>
                      <button
                        onClick={handleClearAllFilters}
                        className='text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline'
                      >
                        Clear all
                      </button>
                    </div>

                    <div className='p-4 space-y-5'>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <FaSearch className='text-gray-400 h-4 w-4' />
                        </div>
                        <input
                          type='search'
                          placeholder='Search'
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className='block w-full pl-10 pr-3 py-1.5 border border-blue-700 rounded-md text-sm focus:ring-1 focus:ring-blue-700 focus:border-blue-700 shadow-sm placeholder-gray-400'
                        />
                      </div>
                      <fieldset className='space-y-2'>
                        <div className='flex items-center'>
                          <input
                            id='sort-asc'
                            name='sortOrder'
                            type='checkbox'
                            value='asc'
                            checked={filterSortOrder === "asc"}
                            onChange={handleSortChange}
                            className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0'
                          />
                          <label
                            htmlFor='sort-asc'
                            className='ml-2 block text-sm text-gray-700'
                          >
                            Low to high
                          </label>
                        </div>
                        <div className='flex items-center'>
                          <input
                            id='sort-desc'
                            name='sortOrder'
                            type='checkbox'
                            value='desc'
                            checked={filterSortOrder === "desc"}
                            onChange={handleSortChange}
                            className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0'
                          />
                          <label
                            htmlFor='sort-desc'
                            className='ml-2 block text-sm text-gray-700'
                          >
                            High to Low
                          </label>
                        </div>
                      </fieldset>

                      <div className='space-y-4 border-t border-gray-200 pt-4'>
                        <div className='relative pt-5 px-1'>
                          <ReactSlider
                            className='slider h-[18px]'
                            thumbClassName='slider-thumb'
                            trackClassName='slider-track'
                            min={0}
                            max={maxPriceLimit}
                            value={filterPriceRange}
                            onChange={handlePriceRangeChange}
                            ariaLabel={["Lower price", "Upper price"]}
                            renderThumb={(props, state) => {
                              const { key, ...restThumbProps } = props;
                              return (
                                <div key={key} {...restThumbProps}>
                                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap'>
                                    <span className='inline-block text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded shadow-sm border border-gray-200'>
                                      {state.valueNow}
                                    </span>
                                  </div>
                                </div>
                              );
                            }}
                            pearling
                            minDistance={1}
                            step={1}
                          />
                        </div>

                        <div className='flex items-center gap-3'>
                          <input
                            type='number'
                            name='min'
                            aria-label='Minimum Price'
                            value={filterPriceRange[0] ?? ""}
                            onChange={handleManualPriceInputChange}
                            className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                            min='0'
                            step='1'
                          />
                          <input
                            type='number'
                            name='max'
                            aria-label='Maximum Price'
                            value={filterPriceRange[1] ?? ""}
                            onChange={handleManualPriceInputChange}
                            className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                            min='0'
                            step='1'
                          />
                        </div>

                        <div className='relative'>
                          <select
                            id='price-condition'
                            value={filterPriceCondition}
                            onChange={handlePriceConditionChange}
                            className='appearance-none block w-full pl-3 pr-8 py-1.5 text-sm border border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 bg-white cursor-pointer'
                          >
                            <option value='eq'>(=) Equals</option>
                            <option value='lt'>({"<"}) Less Than</option>
                            <option value='gt'>({">"}) Greater Than</option>
                            <option value='lte'>
                              ({"<="}) Less Than Equal
                            </option>
                            <option value='gte'>
                              ({">="}) Greater Than Equal
                            </option>
                          </select>
                          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                            <svg
                              className='fill-current h-4 w-4'
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 20 20'
                            >
                              <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className='relative' ref={columnButtonRef}>
                <button
                  onClick={() => setShowColumnPopover((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium shadow-sm transition-colors ${
                    showColumnPopover
                      ? "bg-blue-50 border-blue-300 text-blue-600 ring-1 ring-blue-300"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                  aria-expanded={showColumnPopover}
                >
                  <FaPen /> Columns
                </button>
                {showColumnPopover && (
                  <div
                    ref={columnPanelRef}
                    className='absolute top-full right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-30'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className='flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg'>
                      <h3 className='text-sm font-semibold text-gray-700'>
                        Edit Columns
                      </h3>
                      <button
                        onClick={handleResetColumns}
                        className='text-xs text-blue-700 hover:text-blue-800 font-medium hover:underline'
                      >
                        Reset
                      </button>
                    </div>
                    <div className='p-3'>
                      <div className='relative mb-2'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <FaSearch className='text-gray-400 h-3.5 w-3.5' />
                        </div>
                        <input
                          type='search'
                          placeholder='Find Column...'
                          value={columnSearchTerm}
                          onChange={handleColumnSearchChange}
                          className='block w-full pl-9 pr-3 py-1.5 border border-blue-700 rounded-md text-sm focus:ring-blue-700 focus:border-blue-700 shadow-sm placeholder-gray-400'
                        />
                      </div>
                      <div className='max-h-60 overflow-y-auto space-y-1 pr-1'>
                        {allColumns
                          .filter(
                            (col) =>
                              col.id !== "selection" && col.id !== "action"
                          )
                          .filter((col) =>
                            (
                              col.Header?.toString().toLowerCase() ||
                              col.id.toLowerCase()
                            ).includes(columnSearchTerm.toLowerCase())
                          )
                          .map((column) => (
                            <div
                              key={column.id}
                              className='flex items-center justify-between text-sm p-1.5 rounded hover:bg-gray-100'
                            >
                              <label
                                htmlFor={`toggle-${column.id}`}
                                className='flex items-center cursor-pointer text-gray-700 flex-grow mr-2 truncate'
                                title={
                                  typeof column.Header === "string"
                                    ? column.Header
                                    : column.id
                                }
                              >
                                {typeof column.Header === "string"
                                  ? column.Header
                                  : column.id}
                              </label>
                              <button
                                type='button'
                                onClick={() => column.toggleHidden()}
                                className='p-1 text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 rounded flex-shrink-0 transition-colors'
                                aria-label={`Toggle ${
                                  typeof column.Header === "string"
                                    ? column.Header
                                    : column.id
                                } visibility`}
                                title={`Toggle ${
                                  typeof column.Header === "string"
                                    ? column.Header
                                    : column.id
                                } visibility`}
                              >
                                {column.isVisible ? (
                                  <FaEye
                                    className='w-4 h-4'
                                    aria-hidden='true'
                                  />
                                ) : (
                                  <FaEyeSlash
                                    className='w-4 h-4'
                                    aria-hidden='true'
                                  />
                                )}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto'>
          <ProductTable
            tableInstance={tableInstance}
            onEdit={handleEditProduct}
            onView={handleViewProduct}
            requestDelete={handleRequestDelete}
          />
        </div>

        {isConfirmModalOpen && (
          <div
            className='fixed inset-0 bg-dark-800 bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out'
            onClick={handleCloseConfirmModal}
            aria-modal='true'
            role='dialog'
            aria-labelledby='confirm-delete-title'
          >
            <div
              className='bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-scale-in'
              style={{ animationFillMode: "forwards" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex flex-col items-center text-center'>
                <div className='p-3 bg-red-100 rounded-full mb-3'>
                  <FaExclamationTriangle className='text-red-600 h-6 w-6' />
                </div>
                <h2
                  id='confirm-delete-title'
                  className='text-lg font-semibold mb-2 text-gray-800'
                >
                  Confirm Deletion
                </h2>
                <p className='text-sm text-gray-600 mb-5'>
                  Are you sure you want to delete this product?
                  {productIdToDelete && (
                    <span className='font-medium'>
                      {" "}
                      (Name: {productNameToDelete})
                    </span>
                  )}
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              <div className='flex justify-center gap-3'>
                <button
                  type='button'
                  onClick={handleCloseConfirmModal}
                  disabled={isDeleting}
                  className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className='inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isViewModalOpen && productToView && (
          <div
            className='fixed inset-0 bg-dark-800 bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out'
            onClick={handleCloseViewModal}
            aria-modal='true'
            role='dialog'
            aria-labelledby='view-product-title'
          >
            <div className='bg-white rounded-lg shadow-xl w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-scale-in overflow-hidden'>
              <div className='flex justify-between items-center p-4 border-b border-gray-200'>
                <h2
                  id='view-product-title'
                  className='text-lg font-semibold text-gray-800'
                >
                  Product Details
                </h2>
                <button
                  onClick={handleCloseViewModal}
                  className='text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100'
                  aria-label='Close modal'
                >
                  <FaTimes className='w-5 h-5' />
                </button>
              </div>

              <div className='p-5 space-y-4 max-h-[70vh] overflow-y-auto'>
                <div className='flex items-start gap-4 mb-4'>
                  <ImageWithFallback
                    src={productToView.product?.image}
                    alt={productToView.product?.name || "Product Image"}
                    fallback={
                      <div className='w-20 h-20 rounded-md bg-gray-200 flex-shrink-0'></div>
                    }
                    imgClassName='w-20 h-20 rounded-md object-cover bg-gray-100 flex-shrink-0 border border-gray-200'
                  />
                  <div className='flex-grow'>
                    <h3 className='text-base font-semibold text-gray-900 mb-1'>
                      {productToView.product?.name || "N/A"}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {productToView.product?.details ||
                        productToView.product?.variants ||
                        ""}
                    </p>
                  </div>
                </div>

                <dl className='grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm border-t border-gray-200 pt-4'>
                  <div className='sm:col-span-1'>
                    <dt className='text-gray-500 font-medium'>SKU</dt>
                    <dd className='text-gray-800 mt-0.5'>
                      {productToView.inventory?.sku || "N/A"}
                    </dd>
                  </div>
                  <div className='sm:col-span-1'>
                    <dt className='text-gray-500 font-medium'>Category</dt>
                    <dd className='text-gray-800 mt-0.5'>
                      {productToView.sidebar?.category || "N/A"}
                    </dd>
                  </div>
                  <div className='sm:col-span-1'>
                    <dt className='text-gray-500 font-medium'>
                      Stock Quantity
                    </dt>
                    <dd className='text-gray-800 mt-0.5'>
                      {productToView.inventory?.quantity ?? "N/A"}
                    </dd>
                  </div>
                  <div className='sm:col-span-1'>
                    <dt className='text-gray-500 font-medium'>Price</dt>
                    <dd className='text-gray-800 font-semibold mt-0.5'>
                      {typeof (
                        productToView.total ?? productToView.pricing?.price
                      ) === "number"
                        ? `$${(
                            productToView.total ?? productToView.pricing?.price
                          ).toFixed(2)}`
                        : "N/A"}
                    </dd>
                  </div>
                  <div className='sm:col-span-1'>
                    <dt className='text-gray-500 font-medium'>Status</dt>
                    <dd className='mt-0.5'>
                      <StatusBadge value={productToView.sidebar?.status} />
                    </dd>
                  </div>
                  <div className='sm:col-span-1'>
                    <dt className='text-gray-500 font-medium'>Added Date</dt>
                    <dd className='text-gray-800 mt-0.5'>
                      {productToView.addedDate
                        ? format(
                            new Date(productToView.addedDate),
                            "dd MMM yyyy, hh:mm a"
                          )
                        : "N/A"}
                    </dd>
                  </div>
                  {productToView.customer && (
                    <>
                      <div className='sm:col-span-3 border-t border-gray-200 mt-2 pt-3'>
                        <dt className='text-gray-500 font-medium'>Customer</dt>
                      </div>
                      <div className='sm:col-span-1'>
                        <dt className='text-gray-500'>Name</dt>
                        <dd className='text-gray-800 mt-0.5'>
                          {productToView.customer.name || "N/A"}
                        </dd>
                      </div>
                      <div className='sm:col-span-2'>
                        <dt className='text-gray-500'>Contact</dt>
                        <dd className='text-gray-800 mt-0.5'>
                          {productToView.customer.details || "N/A"}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              <div className='px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end'>
                <button
                  type='button'
                  onClick={handleCloseViewModal}
                  className='px-4 py-2 border border-blue-800 bg-blue-800 rounded-md shadow-sm text-sm font-medium text-white  hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <ProductListPagination
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={filteredProducts.length}
          totalAllItems={allProducts.length}
          gotoPage={gotoPage}
          nextPage={nextPage}
          previousPage={previousPage}
          setPageSize={setPageSize}
        />
      </div>
    </>
  );
};

export default Products;
