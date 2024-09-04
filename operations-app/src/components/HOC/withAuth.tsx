import React, { useEffect, useState, ReactElement } from "react"
import { getCurrentUser } from "aws-amplify/auth"
import { LoadingSpinner } from '../LoadingSpinner';

export interface WithAuthProps {
  user?: any
}

const withAuth = <P extends object>(
  WrappedComponent: React.FC<P & WithAuthProps>
) => {
  const AuthHOC = (props: any): ReactElement => {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
          setLoading(false)
        } catch {
          window.location.href = "/login"
        }
      }

      checkAuth()
    }, [])

    if (loading) {
      return <LoadingSpinner />
    }

    return <WrappedComponent {...props} user={user} />
  }

  return AuthHOC
}

export default withAuth
