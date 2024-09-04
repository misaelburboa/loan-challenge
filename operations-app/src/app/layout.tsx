import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigureAmplify } from "@/components/ConfigureAmplifyClientSide";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Operations App",
  description: "Loan Pro Challenge made by Misael Burboa",
};

export default function withAuthRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigureAmplify />

        {children}
      </body>
    </html>
  );
}
