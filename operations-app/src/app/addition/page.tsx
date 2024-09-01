"use client"

import { FC, useState } from "react"
import Layout from "@/components/Layout"
import { useFormik, FieldArray, FormikProvider, Form, Field } from "formik"
import * as Yup from "yup"
import { fetchAuthSession } from "aws-amplify/auth"
import { useUser } from "@/hooks/useUser"

const AddPage: FC = () => {
  const [result, setResult] = useState<number>(0)

  const { user } = useUser()

  const formik = useFormik({
    initialValues: {
      numbers: [0], // Initialize with one number field
    },
    validationSchema: Yup.object({
      numbers: Yup.array().of(Yup.number().required("Required")),
    }),
    onSubmit: async (values) => {
      try {
        const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

        const result = await fetch(
          "https://dr1q2t3dla.execute-api.us-east-1.amazonaws.com/prod/api/addition",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              values: values.numbers,
              email: "cmburboa@gmail.com",
            }),
          }
        )

        const { operationResponse } = await result.json()

        setResult(operationResponse)
      } catch (e) {
        console.log((e as Error).message)
      }
    },
  })

  return (
    <Layout title="Add Numbers">
      <div className="flex flex-col items-center md:justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Add Numbers
          </h1>
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
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Calculate Sum
                </button>
              </div>
            </Form>
            {result > 0 ? (
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
