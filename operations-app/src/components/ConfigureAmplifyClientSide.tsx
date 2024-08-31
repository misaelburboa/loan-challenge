"use client"
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      // TODO: Add this to env vars
      userPoolId: "us-east-1_9BZJnVsSv",
      userPoolClientId: "2eiucltijkkbqbjnugs64scurp",
      loginWith: {
        email: true,
      },
    },
  },
}, {
  ssr: true,
});

export function ConfigureAmplify() {
  return null;
}