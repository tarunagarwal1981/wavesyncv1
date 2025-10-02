import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  
  console.log('🚀 Starting global setup...')

  // Launch browser
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/auth/login`)
    await page.waitForLoadState('networkidle')

    // Check if we're already authenticated
    const isAuthenticated = await page.evaluate(() => {
      return document.querySelector('[data-testid="authenticated-user"]') !== null
    })

    if (!isAuthenticated) {
      console.log('🔐 Performing authentication...')
      
      // Fill login form with test credentials
      await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL || 'test@example.com')
      await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD || 'testpassword123')
      
      // Submit login form
      await page.click('[data-testid="submit-button"]')
      
      // Wait for redirect to dashboard
      await page.waitForURL(`${baseURL}/dashboard`, { timeout: 10000 })
      
      console.log('✅ Authentication successful')
    } else {
      console.log('ℹ️ User already authenticated')
    }

    // Save authentication state
    await page.context().storageState({ path: storageState! })
    console.log('💾 Authentication state saved')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }

  console.log('✅ Global setup completed')
}

export default globalSetup
