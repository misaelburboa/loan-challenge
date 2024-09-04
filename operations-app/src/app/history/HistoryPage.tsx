"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import DataTable from "./DataTable" // Import the DataTable component
import { fetchAuthSession } from "aws-amplify/auth"
import Layout from "@/components/Layout"
import withAuth, { type WithAuthProps } from "@/components/HOC/withAuth"

type HistoryRecord = {
  id: number
  type: string
  result: string
  user_balance: number
  date: string
  timestamp: number
}

interface HistoryPageProps extends WithAuthProps {}

export const HistoryPage: React.FC<HistoryPageProps> = withAuth(({ user }) => {
  const email = user.signInDetails.loginId

  const nextPageRef = useRef<string>("")

  const [data, setData] = useState<HistoryRecord[]>([])
  const [limit, setLimit] = useState<number>(10)
  const [nextPage, setNextPage] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

        const queryParams: any = {
          email,
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
          console.error(errorMessage)
        }

        const dataFetched = await response.json()

        setData(dataFetched.records)
        nextPageRef.current = dataFetched.nextPage
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [email, limit, nextPage])

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

  const handleRemove = async (row: HistoryRecord) => {
    setData((prevData) =>
      prevData.filter((item) => item.timestamp !== row.timestamp)
    )

    const queryString = new URLSearchParams({
      email,
      timestamp: row.timestamp.toString(),
    }).toString()

    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/soft-remove-record?${queryString}`,
      {
        method: "delete",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    )
  }

  const handleNextPage = () => {
    console.log("NEXT")
    setNextPage(nextPageRef.current)
  }

  const handlePageSize = (pageSize: number) => {
    setLimit(pageSize)
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
})
