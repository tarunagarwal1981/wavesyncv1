import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...')

  try {
    // Launch browser for cleanup
    const browser = await chromium.launch()
    const context = await browser.newContext({ storageState: 'auth.json' })
    const page =await context.newPage()

    // Navigate to logout endpoint
    await page.goto(`/auth/logout`)

    // Wait for logout to complete
    await page.waitForNavigation({ timeout: 10000 })

    console.log('🚪 Logout completed')

  } catch (error) {
    console.error('❌ Teardown error:', error)
    // Don't throw here as it might interfere with report generation
  } finally {
    await browser.close()
  }

  console.log('✅ Global teardown completed')
}

export default globalTeardown
