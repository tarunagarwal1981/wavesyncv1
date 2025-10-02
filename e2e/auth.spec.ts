import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the auth page before each test
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
  })

  test('should display login form correctly', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByText(/forgot password/i)).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/enter a valid email/i)).toBeVisible()
  })

  test('should handle invalid login credentials', async ({ page, request }) => {
    // Mock API response for invalid credentials
    await request.route('**/auth/v1/token', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials'
        })
      })
    })

    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for error message
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page, request }) => {
    // Mock successful login API response
    await request.route('**/auth/v1/token', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          expires_at: Date.now() + 3600000,
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'user-id',
            email: 'test@example.com',
            created_at: '2023-01-01T00:00:00Z'
          }
        })
      })
    })

    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText(/dashboard/i)).toBeVisible()
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByText(/forgot password/i).click()
    
    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })

  test('should send password reset email', async ({ page, request }) => {
    // Navigate to forgot password page
    await page.getByText(/forgot password/i).click()
    
    // Mock successful password reset
    await request.route('**/auth/v1/recover', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'If an account exists, a password reset email has been sent' })
      })
    })

    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()

    await expect(page.getByText(/if an account exists/i)).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.getByText(/don't have an account/i).click()
    
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.getByLabel('Full Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
  })

  test('should handle signup flow successfully', async ({ page, request }) => {
    // Navigate to sign up page
    await page.getByText(/don't have an account/i).click()

    // Mock successful signup
    await request.route('**/auth/v1/signup', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'new-user-id',
            email: 'newuser@example.com',
            created_at: '2023-01-01T00:00:00Z'
          },
          session: null // Email confirmation required
        })
      })
    })

    // Mock profile creation
    await request.route('**/rest/v1/profiles', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({})
      })
    })

    // Fill signup form
    await page.getByLabel('Full Name').fill('John Doe')
    await page.getByLabel('Email').fill('newuser@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm Password').fill('password123')
    await page.getByLabel('Employee ID').fill('EMP123')
    await page.getByLabel('Rank').fill('Captain')
    await page.getByLabel('Nationality').fill('USA')

    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/check your email/i)).toBeVisible()
  })

  test('should handle logout flow', async ({ page }) => {
    // First login
    await request.route('**/auth/v1/token', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token',
          user: { id: 'user-id', email: 'test@example.com' }
        })
      })
    })

    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/dashboard')

    // Find and click logout
    await page.getByRole('button', { name: /user menu/i }).click()
    await page.getByText(/sign out/i).click()

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login')
  })

  test('should persist remember me preference', async ({ page }) => {
    // Check remember me checkbox
    const rememberMe = page.getByLabel(/remember me/i)
    await rememberMe.check()
    await expect(rememberMe).toBeChecked()

    // This test would verify that the session persists
    // Implementation depends on how remember me is handled
  })
})
