import type { FC } from "react"

type CtaProps = {
  isLoading?: boolean
  ctaText: string
}

export const Cta: FC<CtaProps> = ({ ctaText, isLoading = false }) => {
  return (
    <button
      type="submit"
      className="relative w-full px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
    >
      {isLoading ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="spinner"
        >
          <style>
            {`
              .spinner {
                transform-origin: center;
                animation: spinner 0.75s infinite linear;
              }
              @keyframes spinner {
                100% {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
          <path
            d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
            fill="white"
            className="spinner-path"
          />
        </svg>
      ) : (
        <span className={isLoading ? "invisible" : ""}>{ctaText}</span>
      )}
    </button>
  )
}
