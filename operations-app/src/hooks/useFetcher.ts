import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth"
import { useState } from "react"

type FetcherParams = {
  endpoint: string
  onSuccess: (result: string) => void
  onFailure: (message: string) => void
}

type Fetcher<P> = (params: P) => void

type UseFetcherReturnObject<P> = { fetcher: Fetcher<P>; isLoading: boolean }

export const useFetcher = <P>({
  endpoint,
  onSuccess,
  onFailure,
}: FetcherParams): UseFetcherReturnObject<P> => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetcher: Fetcher<P> = async (params: P) => {
    const { signInDetails } = await getCurrentUser()

    try {
      const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            params,
            email: signInDetails?.loginId,
          }),
        }
      )

      if (!response.ok) {
        const errorDetails = await response.text()
        const errorMessage = JSON.parse(errorDetails).message
        onFailure(errorMessage)
        setIsLoading(false)
      }

      const data = await response.json()

      onSuccess(data.result.toString())

      setIsLoading(false)
    } catch (e) {}
  }

  return { fetcher, isLoading }
}
