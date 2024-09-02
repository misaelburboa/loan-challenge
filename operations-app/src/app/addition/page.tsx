"use client"

import { FC, useState } from "react"
import Layout from "@/components/Layout"
import { useFormik, FieldArray, FormikProvider, Form, Field } from "formik"
import * as Yup from "yup"
import { useFetcher } from "@/hooks/useFetcher"
import { Cta } from "@/components/Cta"

type OperationFetcherParams = {
  values: number[]
}

const AddPage: FC = () => {
  const [result, setResult] = useState<string>()
  const [message, setMessage] = useState<string>()

  const onSuccess = (result: string) => {
    setResult(result)
  }

  const onFailure = (message: string) => {
    setMessage(message)
  }

  const { fetcher, isLoading } = useFetcher<OperationFetcherParams>({
    endpoint: "addition",
    onSuccess,
    onFailure,
  })

  const formik = useFormik({
    initialValues: {
      numbers: [0], // Initialize with one number field
    },
    validationSchema: Yup.object({
      numbers: Yup.array().of(Yup.number().required("Required")),
    }),
    onSubmit: async ({ numbers }) => {
      setMessage("")
      await fetcher({ values: numbers })
    },
  })

  return (
    <Layout title="Add Numbers">
      <div className="flex flex-col items-center md:justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Add Numbers
          </h1>

          <p className="pb-5 text-red-500">{message}</p>

          <FormikProvider value={formik}>
            <Form>
              <FieldArray name="numbers">
                {({ push, remove }) => (
                  <>
                    {formik.values.numbers.map((_, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <Field
                          name={`numbers.${index}`}
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => push(0)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    >
                      Add Number Field
                    </button>
                  </>
                )}
              </FieldArray>
              <div className="text-center">
                <Cta isLoading={isLoading} ctaText="Calculate" />
              </div>
            </Form>

            {Number.isFinite(parseInt(result as string, 10)) ? (
              <div className="mt-4">
                <p className="text-lg font-semibold mb-2">The result is:</p>
                <div className="border p-4 rounded">{result}</div>
              </div>
            ) : undefined}
          </FormikProvider>
        </div>
      </div>
    </Layout>
  )
}

export default AddPage
