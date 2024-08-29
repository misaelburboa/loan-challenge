"use client";

import { FC, useState } from "react";
import Layout from "@/components/Layout";
import { useFormik, FieldArray, FormikProvider, Form, Field } from "formik";
import * as Yup from "yup";

const DividePage: FC = () => {
  const [result, setResult] = useState<number | string>("");

  const formik = useFormik({
    initialValues: {
      numbers: [1, 1], // Initialize with two fields to avoid division by zero
    },
    validationSchema: Yup.object({
      numbers: Yup.array().of(Yup.number().required("Required")),
    }),
    onSubmit: (values) => {
      const { numbers } = values;
      if (numbers.length === 0) return setResult("No numbers to divide");
      
      let total = numbers[0];
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === 0) {
          setResult("Cannot divide by zero");
          return;
        }
        total /= numbers[i];
      }
      setResult(total);
    },
  });

  return (
    <Layout title="Divide Numbers">
      <div className="flex flex-col items-center md:justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Divide Numbers
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
                      onClick={() => push(1)} // Initialize new field with 1 to avoid zero
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
                  Calculate Division
                </button>
              </div>
            </Form>
            {result !== "" && (
              <div className="mt-4">
                <p className="text-lg font-semibold mb-2">The result is:</p>
                <div className="border p-4 rounded">{result}</div>
              </div>
            )}
          </FormikProvider>
        </div>
      </div>
    </Layout>
  );
};

export default DividePage;
