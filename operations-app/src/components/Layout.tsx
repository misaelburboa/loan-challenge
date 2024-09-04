"use client"

import { FC, ReactNode } from "react"
import Link from "next/link"
import { signOut } from "aws-amplify/auth"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"

const SignOut = ({ onSignOut }: { onSignOut: () => void }) => {
  const router = useRouter()

  return (
    <Link
      href="/login"
      className="text-white hover:text-gray-300 px-4 py-2"
      onClick={async () => {
        await signOut()
        onSignOut()
        router.push("/login")
      }}
    >
      Logout
    </Link>
  )
}

interface LayoutProps {
  children: ReactNode
  title: string
}

const Layout: FC<LayoutProps> = ({ children, title }) => {
  const { isLoggedIn, onSignOut } = useUser()

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center flex-grow md:flex-grow-0">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <nav className="flex flex-col md:flex-row md:space-x-4 mt-2 md:mt-0">
            <Link
              href="/history"
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              History
            </Link>
            <Link
              href="/addition"
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              Addition
            </Link>
            <Link
              href="/subtraction"
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              Subtraction
            </Link>
            <Link
              href="/multiplication"
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              Multiplication
            </Link>
            <Link
              href="/division"
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              Division
            </Link>
            <Link
              href="/sqrt"
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              Square
            </Link>
            <Link
              href="/random-str"
              className="text-white hover:text-gray-300 px-4 py-2"
            >
              Random String
            </Link>

            {isLoggedIn ? (
              <SignOut
                onSignOut={() => {
                  onSignOut()
                }}
              />
            ) : undefined}
          </nav>
        </div>
      </header>

      <main className="flex-grow">{children}</main>
    </div>
  )
}

export default Layout
