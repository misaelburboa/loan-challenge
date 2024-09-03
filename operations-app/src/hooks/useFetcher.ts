import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth"
import { useState } from "react"

type FetcherParams<OnSuccessResultPrams, OnFailureResultPrams> = {
  endpoint: string
  onSuccess: (result: OnSuccessResultPrams) => void
  onFailure: (message: OnFailureResultPrams) => void
}

type Fetcher<Parameters> = (params: Parameters) => void

type UseFetcherReturnObject<Parameters> = {
  fetcher: Fetcher<Parameters>
  isLoading: boolean
}

export const useFetcher = <
  Parameters,
  OnSuccessResultPrams,
  OnFailureResultPrams
>({
  endpoint,
  onSuccess,
  onFailure,
}: FetcherParams<
  OnSuccessResultPrams,
  OnFailureResultPrams
>): UseFetcherReturnObject<Parameters> => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetcher: Fetcher<Parameters> = async (params: Parameters) => {
    const { signInDetails } = await getCurrentUser()

    try {
      const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`,
        {
          method: "post",
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

      onSuccess(data.result)

      setIsLoading(false)
    } catch (e) {}
  }

  return { fetcher, isLoading }
}
