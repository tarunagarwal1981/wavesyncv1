import { 
  signIn, 
  signUp, 
  signOut, 
  requestPasswordReset, 
  updatePassword,
  clientSignIn,
  clientSignOut,
  checkEmailExists,
  type AuthResult,
  type LoginData,
  type SignUpData,
  type ResetPasswordData,
  type UpdatePasswordData
} from '../auth/actions'
import { setupSupabaseMocks, mockAuthResponses, mockErrorResponse } from '@/test-utils/supabase-mock'

// Mock the supabase module
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/auth/session')

describe('Auth Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = setupSupabaseMocks()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('signIn', () => {
    const validLoginData: LoginData = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should sign in successfully with valid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        mockAuthResponses.signInSuccess()
      )

      const result = await signIn(validLoginData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        mockAuthResponses.authError('Invalid login credentials')
      )

      const result = await signIn(validLoginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email or password')
      expect(result.errorDetails).toBe('Invalid login credentials')
    })

    it('should trim and lowercase email', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        mockAuthResponses.signInSuccess()
      )

      await signIn({
        email: '  Test@EXAMPLE.COM  ',
        password: 'password123',
      })

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle rememberMe parameter', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        mockAuthResponses.signInSuccess()
      )

      await signIn({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      })

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      )

      const result = await signIn(validLoginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
      expect(result.errorDetails).toBe('Network error')
    })
  })

  describe('signUp', () => {
    const validSignUpData: SignUpData = {
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      employeeId: 'EMP123',
      rank: 'Captain',
      nationality: 'USA',
      phone: '+1234567890',
      emergencyContactName: 'John Doe',
      emergencyContactPhone: '+0987654321',
      emergencyContactRelationship: 'Brother',
    }

    beforeEach(() => {
      // Mock successful profile creation
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'row not found' },
        }),
        insert: jest.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      })
    })

    it('should sign up successfully with valid data', async () => {
      mockSupabase.auth.signUp.mockResolvedValue(mockAuthResponses.signUpSuccess())

      const result = await signUp(validSignUpData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      })
    })

    it('should validate password confirmation', async () => {
      const result = await signUp({
        ...validSignUpData,
        password: 'password123',
        confirmPassword: 'differentpassword',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Passwords do not match')
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('should check for existing employee ID', async () => {
      // Mock existing employee ID
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { employee_id: 'EMP123' },
          error: null,
        }),
      })

      const result = await signUp(validSignUpData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Employee ID already exists')
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('should trim all string inputs', async () => {
      mockSupabase.auth.signUp.mockResolvedValue(mockAuthResponses.signUpSuccess())

      await signUp({
        ...validSignUpData,
        employeeId: '  EMP456  ',
        rank: '  Second Officer  ',
        nationality: '  Canada  ',
        phone: '  +1555000000  ',
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle missing emergency contact gracefully', async () => {
      mockSupabase.auth.signUp.mockResolvedValue(mockAuthResponses.signUpSuccess())

      await signUp({
        ...validSignUpData,
        emergencyContactName: undefined,
        emergencyContactPhone: undefined,
      })

      expect(result.success).toBe(true)
    })

    it('should handle auth errors during signup', async () => {
      mockSupabase.auth.signUp.mockResolvedValue(
        mockAuthResponses.authError('User already registered')
      )

      const result = await signUp(validSignUpData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('An account with this email already exists')
    })
  })

  describe('requestPasswordReset', () => {
    it chubould send password reset email successfully', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const result = await requestPasswordReset({ email: 'test@example.com' })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        })
      )
    })

    it('should handle reset email errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Failed to send email' },
      })

      const result = await requestPasswordReset({ email: 'test@example.com' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to send reset email')
    })

    it('should trim and lowercase email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      await requestPasswordReset({ email: '  Test@EXAMPLE.COM  ' })

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      )
    })
  })

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: {},
        error: null,
      })

      const result = await updatePassword({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })
    })

    it('should validate password confirmation', async () => {
      const result = await updatePassword({
        password: 'newpassword123',
        confirmPassword: 'differentpassword',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Passwords do not match')
      expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('should handle update errors', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password update failed' },
      })

      const result = await updatePassword({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update password')
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await signOut()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        data: null,
        error: { message: 'Sign out failed' },
      })

      const result = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to sign out')
    })
  })

  describe('clientSignIn', () => {
    const validLoginData: LoginData = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should sign in successfully with valid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        mockAuthResponses.signInSuccess()
      )

      const result = await clientSignIn(validLoginData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle client-side errors', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        mockAuthResponses.authError('Client error')
      )

      const result = await clientSignIn(validLoginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email or password')
    })
  })

  describe('checkEmailExists', () => {
    it('should return true if email exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { email: 'test@example.com' },
          error: null,
        }),
      })

      const result = await checkEmailExists('test@example.com')

      expect(result).toBe(true)
    })

    it('should return false if email does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'row not found' },
        }),
      })

      const result = await checkEmailExists('nonexistent@example.com')

      expect(result).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const result = await checkEmailExists('test@example.com')

      expect(result).toBe(false)
    })
  })
})
