"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaEye,
  FaTrashAlt,
  FaTimes,
  FaExclamationTriangle,
  FaSearch,
} from "react-icons/fa";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import axios from "axios";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import ReactSlider from "react-slider";
import useDebounce from "@/app/hooks/useDebounce";

const ImageWithFallback = ({ src, alt, fallback, imgClassName }) => {
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
  }, [src]);
  const handleError = () => {
    setError(true);
  };
  if (error || !src) {
    return fallback;
  }
  const safeAlt = typeof alt === "string" ? alt : "Image";
  return (
    <img
      src={src}
      alt={safeAlt}
      onError={handleError}
      className={imgClassName}
    />
  );
};

const DOTS = "...";
const getPaginationRange = (currentPage, totalPages, siblingCount = 1) => {
  const totalPageNumbers = siblingCount + 5;
  if (totalPages <= 0) return [];
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 0);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages - 1
  );
  const shouldShowLeftDots = leftSiblingIndex > 1;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
  const firstPageIndex = 1;
  const lastPageIndex = totalPages;
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, totalPages];
  }
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => lastPageIndex - rightItemCount + 1 + i
    );
    return [firstPageIndex, DOTS, ...rightRange];
  }
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + 1 + i
    );
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

const RecentOrders = ({ onLoaded }) => {
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSortOrder, setFilterSortOrder] = useState("");
  const [maxPriceLimit, setMaxPriceLimit] = useState(1000);
  const [filterPriceRange, setFilterPriceRange] = useState([0, 1000]);
  const [filterPriceCondition, setFilterPriceCondition] = useState("eq");
  const debouncedFilterPriceRange = useDebounce(filterPriceRange, 300);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get("/api/dashboard/recent-order");
      const d = response.data;
      if (Array.isArray(d)) {
        const dataWithIds = d.map((item, i) => ({
          ...item,
          id: item.id || `order-${Date.now()}-${i}`,
          total: typeof item.total === "number" ? item.total : 0,
        }));

        setAllData(dataWithIds);
        setData(dataWithIds);
        setIsLoading(false);
        if (dataWithIds.length > 0) {
          const prices = dataWithIds
            .map((order) => order.total ?? 0)
            .filter((p) => typeof p === "number");
          const max = prices.length > 0 ? Math.max(...prices) : 0;
          const calculatedMax = Math.ceil(max / 100) * 100 || 1000;
          setMaxPriceLimit(calculatedMax);
          setFilterPriceRange([0, calculatedMax]);
        } else {
          setMaxPriceLimit(1000);
          setFilterPriceRange([0, 1000]);
        }
        onLoaded?.();
      } else {
        console.error("API returned non-array data for recent orders:", d);
        setAllData([]);
        setData([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(
        "Error fetching recent orders:",
        error.response?.data?.message || error.message
      );
      setAllData([]);
      setData([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isClient) return;

    let result = allData;

    if (searchTerm) {
      const ls = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          (i.product?.name?.toLowerCase() || "").includes(ls) ||
          (i.customer?.name?.toLowerCase() || "").includes(ls) ||
          (i.id?.toLowerCase() || "").includes(ls)
      );
    }
    if (selectedDate) {
      try {
        const filterDateStr = selectedDate.toISOString().split("T")[0];
        result = result.filter((i) => {
          if (!i.date) return false;
          try {
            const itemDateStr = i.date.split("T")[0];
            return itemDateStr === filterDateStr;
          } catch {
            return false;
          }
        });
      } catch (e) {
        console.error("Date filtering error:", e);
      }
    }

    const [minPrice, maxPrice] = debouncedFilterPriceRange;
    const priceAccessor = (order) => order.total ?? null;

    result = result.filter((order) => {
      const price = priceAccessor(order);
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

    setData(result);
  }, [
    allData,
    searchTerm,
    selectedDate,
    debouncedFilterPriceRange,
    filterPriceCondition,
    filterSortOrder,
    isClient,
  ]);

  const columns = useMemo(
    () => [
      {
        Header: "Product",
        accessor: "product",
        Cell: ({ value }) => (
          <div className='flex items-center gap-3'>
            <ImageWithFallback
              src={value?.image}
              alt={value?.name || "Product"}
              fallback={
                <div className='w-5 h-5 md:w-10 md:h-10 rounded-md bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400'></div>
              }
              imgClassName='w-10 h-10 rounded-md object-cover bg-gray-200 flex-shrink-0'
            />
            <div>
              <div className='text-sm font-medium text-gray-900'>
                {value?.name || "N/A"}
              </div>
              <div className='text-xs text-gray-500'>
                {value?.variants ? `+${value.variants} Products` : ""}
              </div>
            </div>
          </div>
        ),
        disableSortBy: true,
      },
      {
        Header: "Customer",
        accessor: "customer",
        Cell: ({ value }) => (
          <div>
            <div className='text-sm font-medium text-gray-900'>
              {value?.name || "N/A"}
            </div>
            <div className='text-xs text-gray-500'>{value?.details || ""}</div>
          </div>
        ),
        disableSortBy: true,
      },
      {
        Header: "Total",
        accessor: "total",
        Cell: ({ value }) =>
          typeof value === "number" ? `$${value.toFixed(2)}` : "$0.00",
        sortType: "basic",
        id: "total",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`px-2 py-1 rounded-[8px] text-xs font-medium capitalize whitespace-nowrap ${
              value?.toLowerCase() === "processing"
                ? "bg-orange-light text-orange-700"
                : value?.toLowerCase() === "shipped"
                ? "bg-sky-700 text-blue-light"
                : value?.toLowerCase() === "delivered"
                ? "bg-green-light text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {value || "Unknown"}
          </span>
        ),
        disableSortBy: true,
      },
      {
        Header: "Action",
        id: "action",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className='flex gap-3'>
            <button
              className='text-gray-500 hover:text-blue-700 p-1'
              onClick={() => openDetailsModal(row.original)}
              title='View Order'
            >
              <FaEye />
            </button>
            <button
              className='text-gray-500 hover:text-red-600 p-1'
              onClick={() => openConfirmModal(row.original.id, row.original)}
              title='Delete Order'
            >
              <FaTrashAlt />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize, sortBy },
    gotoPage,
    previousPage,
    nextPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
    pageCount,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5, sortBy: [] },
      manualPagination: false,
      manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      sortTypes: {
        basic: (rowA, rowB, columnId) => {
          const a = rowA.values[columnId];
          const b = rowB.values[columnId];
          if (a == null && b == null) return 0;
          if (a == null) return -1;
          if (b == null) return 1;
          return a === b ? 0 : a > b ? 1 : -1;
        },
      },
    },
    useSortBy,
    usePagination
  );

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  const openConfirmModal = (id, order = null) => {
    setOrderIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setOrderIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (!orderIdToDelete) return;
    console.log(`Simulating delete for order ID: ${orderIdToDelete}`);
    setAllData((prev) => prev.filter((order) => order.id !== orderIdToDelete));
    cancelDelete();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    gotoPage(0);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    gotoPage(0);
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    const isChecked = event.target.checked;
    const newSortOrder = isChecked ? value : "";
    setFilterSortOrder(newSortOrder);
    gotoPage(0);
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
      if (newMin > newMax) newMin = newMax;
    } else {
      newMax =
        numericValue === null || isNaN(numericValue)
          ? maxPriceLimit
          : Math.max(0, numericValue);
      if (newMax < newMin) newMax = newMin;
      if (newMax > maxPriceLimit) newMax = maxPriceLimit;
    }
    setFilterPriceRange([newMin, newMax]);
  };

  const handlePriceConditionChange = (event) => {
    setFilterPriceCondition(event.target.value);
    gotoPage(0);
  };

  const clearAllAdvancedFilters = () => {
    setSearchTerm("");
    setFilterSortOrder("");
    setFilterPriceRange([0, maxPriceLimit]);
    setFilterPriceCondition("eq");
    setShowFilterPopover(false);
    gotoPage(0);
  };

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterPopover]);

  const currentTableLength = page.length;
  const totalFilteredItems = data.length;
  const startItem = totalFilteredItems > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem =
    startItem + currentTableLength - (currentTableLength > 0 ? 1 : 0);
  const pageNumbers = useMemo(
    () => getPaginationRange(pageIndex + 1, pageCount),
    [pageIndex, pageCount]
  );

  if (isLoading) {
    return (
      <>
        <div className='h-[600px] w-[70%] bg-white '>
          <h5 className='text-lg md:text-xl text-dark-100 font-bold mr-2 p-4'>
            Recent Orders
          </h5>

          <div
            className='flex justify-center items-center'
            style={{ minHeight: "498px" }}
          >
            <div className='w-12 h-12 rounded-full animate-spin border-2 border-solid border-[#2086bfd9] border-t-transparent'></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className='bg-white p-4 md:p-6 rounded-lg shadow-lg mb-0 w-full lg:w-[70%] relative'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
          <div className='flex items-center'>
            <h5 className='text-lg md:text-xl text-dark-100 font-bold mr-2'>
              Recent Orders
            </h5>
            {allData.length > 0 && (
              <span className='bg-green-light rounded-[8px] px-2 py-1 text-xs md:text-sm text-green-700 font-bold whitespace-nowrap'>
                {allData.length} Total Orders
              </span>
            )}
          </div>
          <div className='flex items-center gap-2 w-full md:w-auto justify-end'>
            <div className='flex-grow md:flex-grow-0 min-w-[150px]'>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                placeholderText='Filter by Date'
                className='w-full p-2 border border-[#858D9D] rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm'
                dateFormat='dd MMM yyyy'
                isClearable
                showPopperArrow={false}
              />
            </div>
            <div className='relative' ref={filterButtonRef}>
              <button
                onClick={() => setShowFilterPopover((prev) => !prev)}
                className={`flex items-center gap-1.5 border px-3 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${
                  showFilterPopover
                    ? "bg-blue-50 border-blue-300 text-blue-600 ring-1 ring-blue-300"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
                aria-expanded={showFilterPopover}
              >
                <HiAdjustmentsHorizontal /> Filters
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
                      onClick={clearAllAdvancedFilters}
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
                          id='sort-asc-order'
                          name='sortOrder'
                          type='checkbox'
                          value='asc'
                          checked={filterSortOrder === "asc"}
                          onChange={handleSortChange}
                          className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0'
                        />
                        <label
                          htmlFor='sort-asc-order'
                          className='ml-2 block text-sm text-gray-700'
                        >
                          Low to high (Total)
                        </label>
                      </div>
                      <div className='flex items-center'>
                        <input
                          id='sort-desc-order'
                          name='sortOrder'
                          type='checkbox'
                          value='desc'
                          checked={filterSortOrder === "desc"}
                          onChange={handleSortChange}
                          className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0'
                        />
                        <label
                          htmlFor='sort-desc-order'
                          className='ml-2 block text-sm text-gray-700'
                        >
                          High to Low (Total)
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
                                    ${state.valueNow}
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
                          placeholder='Min $'
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
                          placeholder='Max $'
                          value={filterPriceRange[1] ?? ""}
                          onChange={handleManualPriceInputChange}
                          className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                          min='0'
                          step='1'
                        />
                      </div>

                      <div className='relative'>
                        <select
                          id='price-condition-order'
                          value={filterPriceCondition}
                          onChange={handlePriceConditionChange}
                          className='appearance-none block w-full pl-3 pr-8 py-1.5 text-sm border border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 bg-white cursor-pointer'
                        >
                          <option value='eq'>(=) Between</option>
                          <option value='lt'>({"<"}) Less Than Max</option>
                          <option value='gt'>({">"}) Greater Than Min</option>
                          <option value='lte'>
                            ({"<="}) Less Than Equal Max
                          </option>
                          <option value='gte'>
                            ({">="}) Greater Than Equal Min
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
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table
            {...getTableProps()}
            className='min-w-full w-full table-auto border-collapse'
          >
            <thead className='bg-gray-50'>
              {headerGroups.map((headerGroup) => {
                const { key: hgKey, ...headerGroupProps } =
                  headerGroup.getHeaderGroupProps();
                return (
                  <tr key={hgKey} {...headerGroupProps}>
                    {headerGroup.headers.map((column) => {
                      const headerProps = column.getHeaderProps(
                        column.canSort ? column.getSortByToggleProps() : {}
                      );
                      const { key: hKey, ...restHeaderProps } = headerProps;
                      return (
                        <th
                          key={hKey}
                          {...restHeaderProps}
                          className={`py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                            column.canSort ? "cursor-pointer group" : ""
                          }`}
                          title={
                            column.canSort
                              ? `Sort by ${column.render("Header")}`
                              : ""
                          }
                        >
                          <div className='flex items-center gap-1'>
                            {column.render("Header")}
                            {column.isSorted ? (
                              <span className=''>
                                {column.isSortedDesc ? "▼" : "▲"}
                              </span>
                            ) : column.canSort ? (
                              <span className='opacity-0 group-hover:opacity-50 transition-opacity'>
                                ▲
                              </span>
                            ) : null}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                const { key: rKey, ...rowProps } = row.getRowProps();
                return (
                  <tr
                    key={rKey}
                    {...rowProps}
                    className='border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 text-sm'
                  >
                    {row.cells.map((cell) => {
                      const { key: cKey, ...cellProps } = cell.getCellProps();
                      return (
                        <td
                          key={cKey}
                          {...cellProps}
                          className='py-3 px-4 align-middle text-gray-700'
                        >
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {page.length === 0 && isClient && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='text-center py-10 text-gray-500'
                  >
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalFilteredItems > pageSize && (
          <div className='flex flex-col md:flex-row justify-between items-center mt-4 md:mt-6 gap-3 text-sm px-4'>
            <div className='text-gray-600'>
              Showing <span className='font-medium'>{startItem}</span> to{" "}
              <span className='font-medium'>{endItem}</span> of{" "}
              <span className='font-medium'>{totalFilteredItems}</span> results
            </div>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className={`p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-600`}
                aria-label='Go to previous page'
              >
                <IoMdArrowDropleft size={20} />
              </button>
              {pageNumbers.map((page, index) => {
                if (page === DOTS) {
                  return (
                    <span
                      key={`${DOTS}-${index}`}
                      className='px-2 py-1 text-gray-500'
                    >
                      {DOTS}
                    </span>
                  );
                }
                const pageNumIndex = page - 1;
                const isActive = pageIndex === pageNumIndex;
                return (
                  <button
                    key={page}
                    onClick={() => gotoPage(pageNumIndex)}
                    disabled={isActive}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white cursor-default shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className={`p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-600`}
                aria-label='Go to next page'
              >
                <IoMdArrowDropright size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Order Details Modal --- */}
      {isDetailsModalOpen && selectedOrder && (
        <div
          className='fixed inset-0 bg-dark-800 bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out'
          onClick={closeDetailsModal}
          aria-modal='true'
          role='dialog'
          aria-labelledby='view-order-title'
        >
          <div
            className='bg-white rounded-lg shadow-xl w-full max-w-md relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-scale-in overflow-hidden'
            style={{ animationFillMode: "forwards" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center p-4 border-b border-gray-200'>
              <h2
                id='view-order-title'
                className='text-lg font-semibold text-gray-800'
              >
                Order Details
              </h2>
              <button
                onClick={closeDetailsModal}
                className='text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100'
                aria-label='Close modal'
              >
                <FaTimes className='w-5 h-5' />
              </button>
            </div>
            <div className='p-5 space-y-4 max-h-[70vh] overflow-y-auto'>
              <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                <div className='sm:col-span-1'>
                  <dt className='text-gray-500 font-medium'>Order ID</dt>
                  <dd className='text-gray-800 mt-0.5'>
                    {selectedOrder.id || "N/A"}
                  </dd>
                </div>
                <div className='sm:col-span-1'>
                  <dt className='text-gray-500 font-medium'>Status</dt>
                  <dd className='mt-0.5'>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        selectedOrder.status?.toLowerCase() === "processing"
                          ? "bg-orange-light text-orange-700"
                          : selectedOrder.status?.toLowerCase() === "shipped"
                          ? "bg-sky-700 text-blue-light"
                          : selectedOrder.status?.toLowerCase() === "delivered"
                          ? "bg-green-light text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedOrder.status || "Unknown"}
                    </span>
                  </dd>
                </div>
                <div className='sm:col-span-1'>
                  <dt className='text-gray-500 font-medium'>Order Date</dt>
                  <dd className='text-gray-800 mt-0.5'>
                    {selectedOrder.date
                      ? new Date(selectedOrder.date).toLocaleDateString()
                      : "N/A"}
                  </dd>
                </div>
                <div className='sm:col-span-1'>
                  <dt className='text-gray-500 font-medium'>Total Amount</dt>
                  <dd className='text-gray-800 font-semibold mt-0.5'>
                    {typeof selectedOrder.total === "number"
                      ? `$${selectedOrder.total.toFixed(2)}`
                      : "N/A"}
                  </dd>
                </div>

                {/* Product Info */}
                <div className='sm:col-span-2 border-t border-gray-200 mt-2 pt-3'>
                  <dt className='text-gray-500 font-medium text-base'>
                    Product Info
                  </dt>
                </div>
                <div className='sm:col-span-2 flex items-start gap-3'>
                  <ImageWithFallback
                    src={selectedOrder.product?.image}
                    alt={selectedOrder.product?.name || "Product"}
                    fallback={
                      <div className='w-16 h-16 rounded-md bg-gray-200 flex-shrink-0'></div>
                    }
                    imgClassName='w-16 h-16 rounded-md object-cover bg-gray-100 flex-shrink-0 border'
                  />
                  <div>
                    <dd className='text-gray-800 font-medium'>
                      {selectedOrder.product?.name || "N/A"}
                    </dd>
                    {selectedOrder.product?.variants && (
                      <dd className='text-xs text-gray-500 mt-0.5'>{`+${selectedOrder.product.variants} Products`}</dd>
                    )}
                    {selectedOrder.product?.details &&
                      selectedOrder.product?.details !== "N/A" && (
                        <dd className='text-xs text-gray-600 mt-1'>
                          {selectedOrder.product.details}
                        </dd>
                      )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className='sm:col-span-2 border-t border-gray-200 mt-2 pt-3'>
                  <dt className='text-gray-500 font-medium text-base'>
                    Customer Info
                  </dt>
                </div>
                <div className='sm:col-span-1'>
                  <dt className='text-gray-500'>Name</dt>
                  <dd className='text-gray-800 mt-0.5'>
                    {selectedOrder.customer?.name || "N/A"}
                  </dd>
                </div>
                <div className='sm:col-span-1'>
                  <dt className='text-gray-500'>Contact/Details</dt>
                  <dd className='text-gray-800 mt-0.5'>
                    {selectedOrder.customer?.details || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className='px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end'>
              <button
                type='button'
                onClick={closeDetailsModal}
                className='px-4 py-2 border border-blue-800 bg-blue-800 rounded-md shadow-sm text-sm font-medium text-white  hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div
          className='fixed inset-0 bg-dark-800 bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4'
          onClick={cancelDelete}
          aria-modal='true'
          role='dialog'
          aria-labelledby='confirm-modal-title'
          aria-describedby='confirm-modal-description'
        >
          <div
            className='bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-scale-in' // Use animation class
            style={{ animationFillMode: "forwards" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
                <FaExclamationTriangle
                  className='h-6 w-6 text-red-600'
                  aria-hidden='true'
                />
              </div>
              <h3
                className='mt-3 text-lg leading-6 font-medium text-gray-900'
                id='confirm-modal-title'
              >
                Confirm Deletion
              </h3>
              <div className='mt-2 px-2 py-1'>
                <p
                  className='text-sm text-gray-500'
                  id='confirm-modal-description'
                >
                  Are you sure you want to delete this order?
                  {selectedOrder?.customer?.name &&
                    ` for ${selectedOrder.customer.name}`}
                  ? This action cannot be undone from this view.
                </p>
              </div>
            </div>
            <div className='mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3'>
              <button
                type='button'
                className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm'
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                type='button'
                className='w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm'
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentOrders;
