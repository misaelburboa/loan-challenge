"use client";

import { FC, useState } from "react";
import Layout from "@/components/Layout";
import { useFormik, FormikProvider, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";

const fetchRandomStrings = async (numStrings = 10, length = 8): Promise<string[]> => {
  try {
    // TODO: include this to the .env variables
    const apiKey = "df5ca201-d5d2-4e01-ad75-89fcd049a38f";

    const url = `https://api.random.org/json-rpc/4/invoke`;

    const response = await axios.post(url, {
      jsonrpc: "2.0",
      method: "generateStrings",
      params: {
        apiKey: apiKey,
        n: numStrings,
        length: length,
        characters:
          "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        replacement: true,
      },
      id: 1,
    });

    return response.data.result.random.data;
  } catch (error) {
    console.error("Error fetching random strings:", error);
    throw error;
  }
};

const CustomOptionsPage: FC = () => {
  const [result, setResult] = useState<string[]>([]);

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
      const { num, len } = values;

      const randomStrings = await fetchRandomStrings(num, len);
      setResult(randomStrings);
    },
  });

  return (
    <Layout title="Random String">
      <div className="flex flex-col items-center md:justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Random Strings Generator
          </h1>
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
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Submit
                </button>
              </div>
            </Form>
            {result.length > 0 && (
              <div className="mt-4">
                <p className="text-lg font-semibold mb-2">Here you have your strings:</p>
                <div className="border p-4 rounded">{
                  result.map(str => (
                    <div key={str}>{str}</div>
                  ))
                }</div>
              </div>
            )}
          </FormikProvider>
        </div>
      </div>
    </Layout>
  );
};

export default CustomOptionsPage;
