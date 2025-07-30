'use client'

import { useState, useCallback } from 'react'
import { withRetry, RetryError, isNetworkError } from '@/lib/retry-utils'

interface UseApiWithRetryOptions {
  maxAttempts?: number
  delay?: number
  onError?: (error: Error, attempt: number) => void
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  retryCount: number
}

export function useApiWithRetry<T>(options: UseApiWithRetryOptions = {}) {
  const { maxAttempts = 3, delay = 1000, onError } = options
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  })

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      retryCount: 0
    }))

    try {
      const result = await withRetry(apiCall, {
        maxAttempts,
        delay,
        shouldRetry: (error) => {
          const shouldRetry = isNetworkError(error) || 
            error.message.includes('500') ||
            error.message.includes('502') ||
            error.message.includes('503') ||
            error.message.includes('504')
          
          let currentRetryCount = 0
          if (shouldRetry) {
            setState(prev => {
              currentRetryCount = prev.retryCount + 1
              return { ...prev, retryCount: currentRetryCount }
            })
            onError?.(error, currentRetryCount)
          }
          
          return shouldRetry
        }
      })

      setState({
        data: result,
        loading: false,
        error: null,
        retryCount: 0
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof RetryError 
        ? `Failed after ${error.attempts} attempts: ${error.lastError.message}`
        : error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        retryCount: error instanceof RetryError ? error.attempts : 1
      })

      throw error
    }
  }, [maxAttempts, delay, onError])

  const retry = useCallback(async (apiCall: () => Promise<T>) => {
    return execute(apiCall)
  }, [execute])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    })
  }, [])

  return {
    ...state,
    execute,
    retry,
    reset
  }
}