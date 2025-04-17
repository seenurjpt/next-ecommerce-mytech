import React from 'react';
import { useTable } from 'react-table';

const SalesTable = ({ dataTable }) => {
  const columns = React.useMemo(
    () => [
      { Header: 'Product', accessor: 'product' },
      { Header: 'Customer', accessor: 'customer' },
      { Header: 'Status', accessor: 'status' },
      { Header: 'Amount', accessor: 'amount' },
      { Header: 'Action', accessor: 'action' },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: dataTable,
    });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-xl font-medium mb-4">Recent Orders</h3>
      <table {...getTableProps()} className="table-auto w-full">
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key, ...headerProps } = headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...headerProps}>
                {headerGroup.headers.map((column) => {
                  const { key, ...columnProps } = column.getHeaderProps();
                  return (
                    <th key={key} {...columnProps} className="py-2 px-4 border-b">
                      {column.render('Header')}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="py-2 px-4 border-b">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
