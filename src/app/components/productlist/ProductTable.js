import React, { useState, useEffect, useMemo, forwardRef, useRef } from "react";
import { FaPen, FaEye, FaTrashAlt } from "react-icons/fa";

export const ImageWithFallback = ({ src, alt, fallback, imgClassName }) => {
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

export const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;
    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);
    return (
      <input
        type='checkbox'
        ref={resolvedRef}
        {...rest}
        className='h-4 w-4 text-blue-700 border-[#858D9D] rounded focus:ring-blue-500 focus:ring-offset-0'
      />
    );
  }
);
IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

export const StatusBadge = ({ value }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";
  switch (value?.toLowerCase()) {
    case "published":
      bgColor = "bg-green-100";
      textColor = "text-green-700";
      break;
    case "draft":
      bgColor = "bg-gray-200";
      textColor = "text-gray-600";
      break;
    case "low stock":
      bgColor = "bg-orange-100";
      textColor = "text-orange-600";
      break;
    case "out of stock":
      bgColor = "bg-red-100";
      textColor = "text-red-700";
      break;
  }
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${bgColor} ${textColor}`}
    >
      {value || "N/A"}
    </span>
  );
};

const ProductTable = ({ tableInstance, onEdit, onView, requestDelete }) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page } =
    tableInstance;

  return (
    <div className='max-w-[100%] overflow-x-auto align-middle inline-block min-w-full'>
      <table
        {...getTableProps()}
        className='min-w-full divide-y divide-gray-200 border border-gray-200'
      >
        <thead className='bg-gray-50'>
          {headerGroups.map((headerGroup) => {
            const { key: hgKey, ...headerGroupProps } =
              headerGroup.getHeaderGroupProps();
            return (
              <tr key={hgKey} {...headerGroupProps}>
                {headerGroup.headers.map((column) => {
                  const { key: hKey, ...headerProps } = column.getHeaderProps(
                    column.getSortByToggleProps()
                  );
                  const headerAlignmentClass =
                    column.id === "selection" ? "text-center" : "text-left";
                  return (
                    <th
                      key={hKey}
                      {...headerProps}
                      scope='col'
                      className={`px-4 py-3 ${headerAlignmentClass} text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap`}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      title={
                        column.canSort
                          ? `Sort by ${column.render("Header")}`
                          : ""
                      }
                    >
                      {column.render("Header")}
                      <span className='ml-1 align-middle'>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            "▼"
                          ) : (
                            "▲"
                          )
                        ) : column.canSort ? (
                          <span className='opacity-30'>▲</span>
                        ) : (
                          ""
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className='bg-white divide-y divide-gray-200'
        >
          {page.map((row) => {
            prepareRow(row);
            const { key: rKey, ...rowProps } = row.getRowProps();
            const originalProduct = row.original;
            return (
              <tr
                key={rKey}
                {...rowProps}
                className={`${
                  row.isSelected ? "bg-blue-80" : ""
                } hover:bg-gray-50 transition-colors duration-150`}
              >
                {row.cells.map((cell) => {
                  const { key: cKey, ...cellProps } = cell.getCellProps();
                  const isActionColumn = cell.column.id === "action";
                  const isSelectionColumn = cell.column.id === "selection";
                  const cellAlignmentClass = isSelectionColumn
                    ? "text-center"
                    : "text-left";

                  return (
                    <td
                      key={cKey}
                      {...cellProps}
                      className={`px-1 py-2 md:px-4 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-600 align-middle ${cellAlignmentClass}`}
                      style={{
                        width: cell.column.width,
                        minWidth: cell.column.minWidth,
                        maxWidth: cell.column.maxWidth,
                      }}
                    >
                      {isActionColumn ? (
                        <div className='flex gap-3 items-center justify-start'>
                          <button
                            onClick={() => onEdit && onEdit(originalProduct)}
                            className='text-gray-400 hover:text-blue-700'
                            title='Edit'
                          >
                            <FaPen size={14} />
                          </button>
                          <button
                            onClick={() => onView && onView(originalProduct)}
                            className='text-gray-400 hover:text-gray-700'
                            title='View'
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              requestDelete &&
                              requestDelete(
                                originalProduct.id,
                                originalProduct.product.name
                              )
                            }
                            className='text-gray-400 hover:text-red-600'
                            title='Delete'
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      ) : (
                        cell.render("Cell")
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {page.length === 0 && (
            <tr>
              <td
                colSpan={headerGroups[0]?.headers.length || 10}
                className='text-center py-6 text-gray-500'
              >
                No products found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
