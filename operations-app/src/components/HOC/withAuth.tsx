'use client'

import React, { useEffect, ReactElement } from "react"
import { getCurrentUser } from "aws-amplify/auth"

interface WithAuthProps {
}

const withAuth = (WrappedComponent: React.ComponentType<WithAuthProps>) => {
  const AuthHOC = (props: WithAuthProps): ReactElement => {
    const [loading, setLoading] = React.useState(true)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const { signInDetails } = await getCurrentUser()
          console.log(signInDetails)
          setLoading(false)
        } catch {
          window.location.href = "/login"
        }
      }

      checkAuth()
    }, [])

    if (loading) {
      return <div>Loading...</div>
    }

    return <WrappedComponent {...props} />
  }

  return AuthHOC
}

export default withAuth
