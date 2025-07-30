interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoffFactor?: number
  maxDelay?: number
  shouldRetry?: (error: Error) => boolean
}

export class RetryError extends Error {
  constructor(message: string, public attempts: number, public lastError: Error) {
    super(message)
    this.name = 'RetryError'
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffFactor = 2,
    maxDelay = 10000,
    shouldRetry = () => true
  } = options

  let lastError: Error
  let currentDelay = delay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw new RetryError(
          `Failed after ${attempt} attempts: ${lastError.message}`,
          attempt,
          lastError
        )
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay)
    }
  }

  throw lastError!
}

export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('timeout') ||
    error.message.includes('Failed to fetch') ||
    error.name === 'NetworkError' ||
    error.name === 'TimeoutError'
  )
}

export function isRetryableHttpError(status: number): boolean {
  // Retry on server errors and some client errors
  return (
    status >= 500 || // Server errors
    status === 408 || // Request timeout
    status === 429 || // Too many requests
    status === 0      // Network error
  )
}

export async function retryFetch(
  url: string,
  options: RequestInit & { retryOptions?: RetryOptions } = {}
): Promise<Response> {
  const { retryOptions, ...fetchOptions } = options

  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions)
      
      if (!response.ok && isRetryableHttpError(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response
    },
    {
      shouldRetry: (error) => isNetworkError(error),
      ...retryOptions
    }
  )
}