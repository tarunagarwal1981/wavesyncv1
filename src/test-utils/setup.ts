import '@testing-library/jest-dom'
import { testEnvironment } from './test-helpers'

// Global test setup
beforeEach(() => {
  testEnvironment.setup()
})

afterEach(() => {
  testEnvironment.cleanup()
})

// Global test timeout
jest.setTimeout(10000)
