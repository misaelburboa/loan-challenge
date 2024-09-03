"use client";

import { FC, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import {
  autoSignIn,
  confirmSignUp,
  SignInOutput,
  signUp,
  SignUpOutput,
} from "aws-amplify/auth";
import { useRouter } from "next/navigation";

type SignUpState = SignUpOutput["nextStep"];
type SignInState = SignInOutput["nextStep"];

// Define validation schema for Registration Form
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Required"),
});

const RegistrationForm = ({
  onStepChange,
}: {
  onStepChange: (step: SignUpState) => void;
}) => {
  const [message, setMessage] = useState<string>("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Register
        </h1>

        <p className="text-red-500 text-sm mb-5 text-center" role="alert">
          {message}
        </p>

        <Formik
          initialValues={{ email: "", password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={async ({ email, password, confirmPassword }) => {
            if (password !== confirmPassword) {
              return;
            }

            try {
              const { nextStep } = await signUp({
                username: email,
                password,
                options: {
                  userAttributes: {
                    email,
                  },
                  autoSignIn: true,
                },
              });

              onStepChange(nextStep);
            } catch (error) {
              setMessage((error as Error).message);
            }
          }}
        >
          {() => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Retype Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Register
              </button>

              <span className="mt-1 inline-block">
                Already have an account?&nbsp;
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </span>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// validation schema for confirm sign up
const validationSchemaConfirmSignUp = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  verification_code: Yup.string()
    .min(6, "Verification code must be at least 6 characters")
    .required("Required"),
});

const ConfirmSignUp = ({
  onStepChange,
}: {
  onStepChange: (step: SignUpState) => void;
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Register
        </h1>
        <Formik
          initialValues={{ email: "", verification_code: "" }}
          validationSchema={validationSchemaConfirmSignUp}
          onSubmit={async ({ email, verification_code }) => {
            try {
              const { nextStep } = await confirmSignUp({
                confirmationCode: verification_code,
                username: email,
              });

              onStepChange(nextStep);
            } catch (error) {
              console.error(error);
            }
          }}
        >
          {() => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="verification_code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <Field
                  type="text"
                  id="verification_code"
                  name="verification_code"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Verification Code"
                />
                <ErrorMessage
                  name="verification_code"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Verify Code
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const AutoSignIn = ({
  onStepChange,
}: {
  onStepChange: (step: SignInState) => void;
}) => {
  useEffect(() => {
    const asyncSignIn = async () => {
      const { nextStep } = await autoSignIn();

      onStepChange(nextStep);
    };

    asyncSignIn();
  }, [onStepChange]);

  return <div>Signin in</div>;
};

const Register: FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<SignUpState | SignInState | null>(null);

  useEffect(() => {
    if (!step) return;

    if ((step as SignInState).signInStep === "DONE") {
      router.push("/history");
    }
  }, [router, step]);

  if (step) {
    if ((step as SignUpState).signUpStep === "CONFIRM_SIGN_UP") {
      return <ConfirmSignUp onStepChange={setStep} />;
    } else if ((step as SignUpState).signUpStep === "COMPLETE_AUTO_SIGN_IN") {
      return <AutoSignIn onStepChange={setStep} />;
    }
  }
  return <RegistrationForm onStepChange={setStep} />;
};

export default Register;
