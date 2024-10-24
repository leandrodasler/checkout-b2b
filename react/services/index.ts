import { QueryClient } from '@tanstack/react-query'

import type { ApiResponse } from '../typings'

const MAX_RETRIES = 10
const RETRY_MESSAGE_PATTERN = ['unhealthy', 'genericerror']

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const { message: errorMessage } = error as Error

        console.error('Request Error:', { errorMessage, failureCount })

        const shouldRetry = RETRY_MESSAGE_PATTERN.some((pattern) =>
          errorMessage.toLowerCase().includes(pattern)
        )

        return shouldRetry && failureCount < MAX_RETRIES
      },
    },
  },
})

export async function apiRequest<Response extends ApiResponse, Body = unknown>(
  url: string,
  method: string,
  body?: Body
) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const json: Response = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof json?.error === 'object'
        ? json?.error?.message
        : typeof json?.response?.data === 'object'
        ? json?.response?.data?.error
        : json?.response?.data ??
          json?.message ??
          json?.code ??
          response.status.toString()
    )
  }

  return json
}
