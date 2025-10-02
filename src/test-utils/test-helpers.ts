import { waitFor } from '@testing-library/react'

// Wait for multiple async operations to complete
export const waitForMultipleAsync = async (
  promises: Promise<unknown>[],
  timeout: number = 5000
) => {
  return Promise.allSettled(
    promises.map(promise => 
      waitFor(() => promise, { timeout })
    )
  )
}

// Mock successful API calls
export const mockSuccessfulApiCall = <T>(data: T, delay: number = 100) => {
  return new Promise<{ data: T; error: null }>((resolve) => {
    setTimeout(() => {
      resolve({ data, error: null })
    }, delay)
  })
}

// Mock failed API calls  
export const mockFailedApiCall = (error: string, delay: number = 100) => {
  return new Promise<{ data: null; error: string }>((resolve) => {
    setTimeout(() => {
      resolve({ data: null, error })
    }, delay)
  })
}

// Create a mock function that returns a promise
export const createMockAsyncFunction = <T extends any[], R>(
  result: R,
  delay: number = 0
) => {
  return jest.fn().mockImplementation((...args: T) => {
    return delay > 0 
      ? new Promise<R>(resolve => setTimeout(() => resolve(result), delay))
      : Promise.resolve(result)
  })
}

// Mock localStorage
export class MockStorage {
  private storage: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.storage[key] || null
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value
  }

  removeItem(key: string): void {
    delete this.storage[key]
  }

  clear(): void {
    this.storage = {}
  }

  get length(): number {
    return Object.keys(this.storage).length
  }

  key(index: number): string | null {
    return Object.keys(this.storage)[index] || null
  }
}

// Mock window.matchMedia
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock window.location
export const mockLocation = (url: string = 'http://localhost:3000') => {
  delete (window as any).location
  window.location = new URL(url) as any
}

// Create a mock event
export const createMockEvent = (type: string, properties: Record<string, any> = {}) => {
  const event = new Event(type)
  Object.assign(event, properties)
  return event
}

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  class MockIntersectionObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  
  global.IntersectionObserver = MockIntersectionObserver as any
}

// Mock ResizeObserver
export const mockResizeObserver = () => {
  class MockResizeObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  
  global.ResizeObserver = MockResizeObserver as any
}

// Test utils for date manipulation
export const createTestDate = {
  past: (days: number = 30) => new Date(Date.now() - days * 24 * 60 * 60 * 1000),
  future: (days: number = 30) => new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  today: () => new Date(),
  tomorrow: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  yesterday: () => new Date(Date.now() - 24 * 60 * 60 * 1000),
}

// Test utils for async operations
export const asyncUtils = {
  // Wait for a condition to be true
  waitForCondition: async (
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      if (condition()) return true
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    throw new Error(`Condition not met within ${timeout}ms`)
  },

  // Retry an async operation
  retry: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    throw lastError!
  },
}

// Test environment helpers
export const testEnvironment = {
  // Set up test environment
  setup: () => {
    // Mock fetch
    global.fetch = jest.fn()
    
    // Mock localStorage
    const mockStorage = new MockStorage()
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    })
    
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
      writable: true,
    })
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-anon-key'
  },

  // Clean up test environment
  cleanup: () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    if (global.fetch) {
      (global.fetch as jest.Mock).mockRestore()
    }
  },
}
