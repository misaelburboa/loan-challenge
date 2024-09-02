"use client"

import { FC, useState } from "react"
import Layout from "@/components/Layout"
import { useFormik, FormikProvider, Form, Field } from "formik"
import * as Yup from "yup"
import { Cta } from "@/components/Cta"
import { useFetcher } from "@/hooks/useFetcher"

type RandomStringFetcherParams = {
  num: number
  len: number
}

const CustomOptionsPage: FC = () => {
  const [result, setResult] = useState<string[]>([])
  const [message, setMessage] = useState<string>()

  const onSuccess = (result: string[]) => {
    console.log(result);
    setResult(result)
  }
  const onFailure = (message: string) => {
    setMessage(message)
  }

  const { fetcher, isLoading } = useFetcher<
    RandomStringFetcherParams,
    string[],
    string
  >({
    endpoint: "random-str",
    onSuccess,
    onFailure,
  })

  const formik = useFormik({
    initialValues: {
      num: 1,
      len: 8,
    },
    validationSchema: Yup.object({
      num: Yup.number()
        .required("Required")
        .integer("Must be an integer")
        .min(0, "Cannot be negative"),
      len: Yup.number()
        .required("Required")
        .integer("Must be an integer")
        .min(0, "Cannot be negative"),
    }),
    onSubmit: async (values) => {
      setMessage("")
      await fetcher(values)
    },
  })

  return (
    <Layout title="Random String">
      <div className="flex flex-col items-center md:justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Random Strings Generator
          </h1>

          <p className="pb-5 text-red-500">{message}</p>

          <FormikProvider value={formik}>
            <Form>
              <div className="mb-4">
                <label htmlFor="num" className="block text-gray-700">
                  Number (num):
                </label>
                <Field
                  id="num"
                  name="num"
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="len" className="block text-gray-700">
                  Length (len):
                </label>
                <Field
                  id="len"
                  name="len"
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-center">
                <Cta isLoading={isLoading} ctaText="Generate String" />
              </div>
            </Form>
            {result?.length > 0 && (
              <div className="mt-4">
                <p className="text-lg font-semibold mb-2">
                  Here you have your strings:
                </p>
                <div className="border p-4 rounded">
                  {result.map((str) => (
                    <div key={str}>{str}</div>
                  ))}
                </div>
              </div>
            )}
          </FormikProvider>
        </div>
      </div>
    </Layout>
  )
}

export default CustomOptionsPage
