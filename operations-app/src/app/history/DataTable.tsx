"use client"

/* eslint-disable react/jsx-key */
import React from "react"
import {
  useTable,
  useFilters,
  usePagination,
  TableInstance,
  type Column,
  type Row,
} from "react-table"

type HistoryRecord = {
  id: number
  type: string
  result: string
  user_balance: number
  date: string
  timestamp: number
}

// Define types for props
type DataTableProps = {
  columns: Column[]
  data: HistoryRecord[]
  onRemove: (row: HistoryRecord) => void
  nextPage: () => void
  setPageSize: (size: number) => void
  pageSize: number
}

// Table component
const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onRemove,
  nextPage,
  setPageSize,
  pageSize,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page: pagedData,
    prepareRow,
    state: { pageSize: statePageSize },
  }: TableInstance = useTable(
    {
      columns,
      data,
      // manualPagination: true,
      // pageCount,
    },
    useFilters,
    usePagination
  )

  return (
    <div>
      <table
        {...getTableProps()}
        className="min-w-full divide-y divide-gray-200"
      >
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.render("Header")}
                </th>
              ))}
              <th className="px-6 py-3"></th>{" "}
              {/* Extra header for Remove button */}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className="bg-white divide-y divide-gray-200"
        >
          {pagedData.map((row: Row) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: Record<string, any>) => (
                  <td
                    {...cell.getCellProps()}
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <button
                    onClick={() => onRemove(row.original as HistoryRecord)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => nextPage()}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded shadow-sm hover:bg-gray-50"
          >
            {">"}
          </button>
        </div>
        <div className="flex items-center">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option
                key={size}
                value={size}
              >
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default DataTable
