"use client"
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      // TODO: Add this to env vars
      userPoolId: "us-east-1_tl26dBIVI",
      userPoolClientId: "6mn5lrpnsfhpaojosbp6l6tal5",
    },
  },
}, {
  ssr: true,
});

export function ConfigureAmplify() {
  return null;
}