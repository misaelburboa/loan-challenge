"use client";

import { FC, useState } from "react";
import Layout from "@/components/Layout";
import { useFormik, FormikProvider, Form, Field } from "formik";
import * as Yup from "yup";

const SqrtSinglePage: FC = () => {
  const [result, setResult] = useState<number | string>("");

  const formik = useFormik({
    initialValues: {
      number: 0, // Initialize with one number field
    },
    validationSchema: Yup.object({
      number: Yup.number().required("Required").min(0, "Cannot be negative"), // Validation for number
    }),
    onSubmit: (values) => {
      const { number } = values;
      if (number < 0) {
        setResult("Cannot calculate square root of negative numbers");
        return;
      }
      const sqrt = Math.sqrt(number);
      setResult(sqrt);
    },
  });

  return (
    <Layout title="Square Root of Number">
      <div className="flex flex-col items-center md:justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Square Root of a Number
          </h1>
          <FormikProvider value={formik}>
            <Form>
              <div className="mb-4">
                <Field
                  name="number"
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a number"
                />
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Calculate Square Root
                </button>
              </div>
            </Form>
            {result !== "" && (
              <div className="mt-4">
                <p className="text-lg font-semibold mb-2">The result is:</p>
                <div className="border p-4 rounded">
                  {typeof result === "string" ? result : result.toFixed(4)}
                </div>
              </div>
            )}
          </FormikProvider>
        </div>
      </div>
    </Layout>
  );
};

export default SqrtSinglePage;
