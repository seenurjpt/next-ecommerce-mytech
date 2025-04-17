import React, { useMemo } from "react";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

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
    let lC = 3 + 2 * siblingCount;
    let lR = Array.from({ length: lC }, (_, i) => i + 1);
    return [...lR, DOTS, totalPages];
  }
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rC = 3 + 2 * siblingCount;
    let rR = Array.from({ length: rC }, (_, i) => lastPageIndex - rC + 1 + i);
    return [firstPageIndex, DOTS, ...rR];
  }
  if (shouldShowLeftDots && shouldShowRightDots) {
    let mR = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + 1 + i
    );
    return [firstPageIndex, DOTS, ...mR, DOTS, lastPageIndex];
  }
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

const ProductListPagination = ({
  canPreviousPage,
  canNextPage,
  pageCount,
  pageIndex,
  pageSize,
  totalItems,
  gotoPage,
  nextPage,
  previousPage,
}) => {
  const pageNumbers = useMemo(
    () => getPaginationRange(pageIndex + 1, pageCount),
    [pageIndex, pageCount]
  );
  const startItem = totalItems > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  if (!totalItems || pageCount <= 1) return null; // Don't render if no items or only one page

  return (
    <div className='flex flex-col md:flex-row justify-between items-center md:mt-6 gap-3 text-sm'>
      <div className='text-gray-600 font-bold'>
        {" "}
        Showing {startItem} to {endItem} of {totalItems}
      </div>
      <div className='flex items-center gap-1'>
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className={`px-2 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 text-blue-700 bg-blue-80`}
          aria-label='Go to previous page'
        >
          {" "}
          <IoMdArrowDropleft />
        </button>
        {pageNumbers.map((page, index) => {
          if (page === DOTS) {
            return (
              <span
                key={`${DOTS}-${index}`}
                className='px-3 py-1 text-gray-500'
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
              className={`px-3 py-1 rounded-md font-medium ${
                isActive
                  ? "bg-blue-90 text-white cursor-default shadow-sm"
                  : "bg-blue-80 text-blue-700 hover:bg-blue-100"
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
          className={`px-2 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 text-blue-700 bg-blue-80`}
          aria-label='Go to next page'
        >
          {" "}
          <IoMdArrowDropright />
        </button>
      </div>
    </div>
  );
};

export default ProductListPagination;
