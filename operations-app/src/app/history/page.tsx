"use client";

import React, { FC, useState, useEffect } from "react";
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
} from "react-table";
import axios from "axios";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

interface Operation {
  id: number;
  name: string;
  date: string;
  amount: number;
}

const OperationsPage: FC = () => {
  const [data, setData] = useState<Operation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10); // Single declaration of pageSize

  const fetchOperations = async () => {
    try {
      setLoading(true);

      // TODO: Make this endpoint available
      const response = await axios.get("/api/operations");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching operations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const columns = React.useMemo(
    () => [
      { Header: "Operation Type", accessor: "type" },
      { Header: "Date", accessor: "date" },
      { Header: "Cost", accessor: "cost" },
      {
        Header: "Balance",
        accessor: "balance",
        Cell: ({ value }: any) => `$${value.toFixed(2)}`,
      },
      {
        Header: "Actions",
        Cell: ({ row }: any) => (
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </button>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { pageIndex },
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    previousPage,
    nextPage,
    setPageSize: setTablePageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize, // Use the single pageSize state
      },
      manualPagination: true,
      pageCount: Math.ceil(data.length / pageSize),
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/operations/${id}`);
      fetchOperations(); // Refresh data after delete
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  return (
    <Layout title="Operations History">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Operations Records</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table
              {...getTableProps()}
              className="min-w-full divide-y divide-gray-200"
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        className="px-6 py-3"
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center mt-4">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="mx-2">
                Page {pageIndex + 1} of {pageCount}
              </span>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setPageSize(newSize);
                  setTablePageSize(newSize); // Update react-table's pageSize
                }}
                className="ml-4 border p-2 rounded"
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default OperationsPage;
