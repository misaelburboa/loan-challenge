"use client"
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      // TODO: Add this to env vars
      userPoolId: "us-east-1_TtRocItWh",
      userPoolClientId: "5l7qiva8tipiqj543t58bunfd0",
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