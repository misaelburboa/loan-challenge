"use client"

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react"
import DataTable from "./DataTable" // Import the DataTable component
import { fetchAuthSession } from "aws-amplify/auth"
import Layout from "@/components/Layout"

type HistoryRecord = {
  id: number
  type: string
  result: string
  user_balance: number
  date: string
  timestamp: number
}

const History: React.FC = () => {
  const nextPageRef = useRef<string>("")

  const [data, setData] = useState<HistoryRecord[]>([])
  const [limit, setLimit] = useState<number>(10)
  const [nextPage, setNextPage] = useState<string>("")

  useEffect(() => {
    console.log("USEEFF")
    const fetchData = async () => {
      try {
        const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

        const queryParams: any = {
          email: "cmburboa@gmail.com",
          limit,
        }

        if (nextPage) {
          queryParams.lastEvaluated = nextPage
        }

        const queryString = new URLSearchParams(queryParams).toString()

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/history?${queryString}`,
          {
            method: "get",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        )

        if (!response.ok) {
          const errorDetails = await response.text()
          const errorMessage = JSON.parse(errorDetails).message
        }

        const dataFetched = await response.json()

        // const dataFetched = JSON.parse(
        //   '{"records":[{"type":"subtract","user_balance":886,"result":"7","date":"September 2, 2024","timestamp":1725312617661},{"type":"subtract","user_balance":885,"result":"7","date":"September 2, 2024","timestamp":1725312633801},{"type":"subtraction","user_balance":884,"result":"-2","date":"September 2, 2024","timestamp":1725313865094},{"type":"subtraction","user_balance":883,"result":"-2","date":"September 2, 2024","timestamp":1725314029593},{"type":"multiplication","user_balance":880,"result":"8","date":"September 2, 2024","timestamp":1725314824977}],"nextPage":"%7B%22pk%22%3A%7B%22S%22%3A%22cmburboa%40gmail.com%22%7D%2C%22sk%22%3A%7B%22N%22%3A%221725314824977%22%7D%7D"}'
        // )

        setData(dataFetched.records)
        nextPageRef.current = dataFetched.nextPage
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [limit, nextPage])

  const columns = useMemo(
    () => [
      {
        Header: "TS",
        accessor: "timestamp",
        isVisible: false,
      },
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "Balance",
        accessor: "user_balance",
      },
      {
        Header: "Result",
        accessor: "result",
      },
      {
        Header: "Date",
        accessor: "date",
      },
    ],
    []
  )

  const handleRemove = (row: HistoryRecord) => {
    setData((prevData) =>
      prevData.filter((item) => item.timestamp !== row.timestamp)
    )
  }

  const handleNextPage = () => {
    console.log("NEXT")
    setNextPage(nextPageRef.current)
  }

  const handlePageSize = (pageSize: number) => {
    setLimit(pageSize)
    // fetchData()
  }

  return (
    <Layout title="History">
      <div className="flex flex-col items-center md:justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Operations History
        </h1>

        <DataTable
          columns={columns}
          data={data}
          onRemove={handleRemove}
          pageSize={limit}
          setPageSize={handlePageSize}
          nextPage={handleNextPage}
        />
      </div>
    </Layout>
  )
}

export default History
