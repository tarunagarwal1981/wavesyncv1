import { jest } from '@jest/globals'

// Mock Supabase client factory
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
    refreshSession: jest.fn(),
    updateUser: jest.fn(),
    setAuth: jest.fn(),
  },
  from: jest.fn(),
  rpc: jest.fn(),
  storage: {
    from: jest.fn(),
    getPublicUrl: jest.fn(),
    upload: jest.fn(),
    download: jest.fn(),
    remove: jest.fn(),
    list: jest.fn(),
  },
}

// Mock query builder methods
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  rangeGt: jest.fn().mockReturnThis(),
  rangeGte: jest.fn().mockReturnThis(),
  rangeLt: jest.fn().mockReturnThis(),
  rangeLte: jest.fn().mockReturnThis(),
  rangeAdjacent: jest.fn().mockReturnThis(),
  overlaps: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  csv: jest.fn().mockReturnThis(),
  geojson: jest.fn().mockReturnThis(),
  explain: jest.fn().mockReturnThis(),
  rollback: jest.fn().mockReturnThis(),
  returns: jest.fn().mockReturnThis(),
  abortSignal: jest.fn().mockReturnThis(),
  then: jest.fn(),
  catch: jest.fn(),
}

// Configure the from method to return mock query builder
mockSupabaseClient.from.mockReturnValue(mockQueryBuilder)

// Mock successful responses
export const mockSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
  count: Array.isArray(data) ? data.length : 1,
})

// Mock error responses
export const mockErrorResponse = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code,
    details: message,
    hint: null,
  },
  status: 400,
  statusText: 'Bad Request',
})

// Mock authentication responses
export const mockAuthResponses = {
  // Successful login
  signInSuccess: (user = mockUser()) => ({
    data: {
      user,
      session: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        token_type: 'bearer',
      },
    },
    error: null,
  }),

  // Successful signup
  signUpSuccess: (user = mockUser()) => ({
    data: {
      user,
      session: null, // Email confirmation required
    },
    error: null,
  }),

  // Auth error
  authError: (message = 'Invalid credentials') => ({
    data: {
      user: null,
      session: null,
    },
    error: {
      message,
      code: 'invalid_credentials',
    },
  }),
}

// Helper to create mock user
export const mockUser = (overrides = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  factors: [],
  ...overrides,
})

// Setup mock auth state change handler
export const setupMockAuthStateChange = () => {
  const listeners: Array<(event: string, session: any) => void> = []
  
  mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
    listeners.push(callback)
    return {
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    }
  })

  // Helper to trigger auth state change
  const triggerAuthStateChange = (event: string, session: any) => {
    listeners.forEach(listener => listener(event, session))
  }

  return { triggerAuthStateChange }
}

// Mock table operations
export const mockTableOperations = {
  // Certificates
  getCertificates: jest.fn().mockResolvedValue(mockSuccessResponse([
    {
      id: 'cert-1',
      certificate_name: 'Certificate of Competency',
      certificate_type: 'COC',
      issue_date: '2023-01-01',
      expiry_date: '2024-01-01',
      status: 'valid',
    },
  ])),

  // Assignments
  getAssignments: jest.fn().mockResolvedValue(mockSuccessResponse([
    {
      id: 'assignment-1',
      vessel_name: 'Test Vessel',
      status: 'active',
    },
  ])),

  // Circulars
  getCirculars: jest.fn().mockResolvedValue(mockSuccessResponse([
    {
      id: 'circular-1',
      title: 'Test Circular',
      priority: 'medium',
      requires_acknowledgment: true,
    },
  ])),

  // Generic insert
  insert: jest.fn().mockResolvedValue(mockSuccessResponse({ id: 'new-record' })),
  
  // Generic update
  update: jest.fn().mockResolvedValue(mockSuccessResponse({ id: 'updated-record' })),
  
  // Generic delete
  delete: jest.fn().mockResolvedValue(mockSuccessResponse(null)),
}

// Comprehensive setup function
export const setupSupabaseMocks = () => {
  // Reset all mocks
  jest.clearAllMocks()

  // Setup default implementations
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: mockUser() },
    error: null,
  })

  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(
    mockAuthResponses.signInSuccess()
  )

  mockSupabaseClient.auth.signOut.mockResolvedValue({
    data: null,
    error: null,
  })

  mockSupabaseClient.auth.signUp.mockResolvedValue(
    mockAuthResponses.signUpSuccess()
  )

  // Setup table operations
  Object.values(mockTableOperations).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      // These are already configured above
    }
  })

  return {
    client: mockSupabaseClient,
    queryBuilder: mockQueryBuilder,
    responses: mockSuccessResponse,
    errors: mockErrorResponse,
    authResponses: mockAuthResponses,
    tableOperations: mockTableOperations,
  }
}

// Export the main mock client
export default mockSupabaseClient
