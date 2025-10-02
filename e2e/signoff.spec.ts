import { test, expect } from '@playwright/test'

test.describe('Signoff Checklist', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up authentication state
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'fake-access-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    // Navigate to signoff page
    await page.goto('/signoff')
    await page.waitForLoadState('networkidle')
  })

  test('should display signoff checklist', async ({ page, request }) => {
    // Mock checklist data
    await request.route('**/signoff-checklist*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'item1',
              item_text: 'Complete handover notes',
              category: 'Documentation',
              is_completed: false
            },
            {
              id: 'item2',
              item_text: 'Return company equipment',
              category: 'Equipment',
              is_completed: true
            },
            {
              id: 'item3',
              item_text: 'Submit incident reports',
              category: 'Safety',
              is_completed: false
            }
          ]
        })
      })
    })

    await expect(page.getByText(/signoff checklist/i)).toBeVisible()
    await expect(page.getByText('Complete handover notes')).toBeVisible()
    await expect(page.getByText('Return company equipment')).toBeVisible()
    await expect(page.getByText('Submit incident reports')).toBeVisible()
  })

  test('should complete checklist items', async ({ page, request }) => {
    await request.route('**/signoff-checklist*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'item1',
              item_text: 'Complete handover notes',
              category: 'Documentation',
              is_completed: false
            }
          ]
        })
      })
    })

    // Mock successful update
    await request.route('**/signoff-checklist/item1*', { method: 'PUT' }, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'item1',
          is_completed: true,
          completed_at: new Date().toISOString()
        })
      })
    })

    // Check the checkbox for first item
    const checkbox = page.getByRole('checkbox', { name: /complete handover notes/i })
    await checkbox.check()

    // Should show as completed
    await expect(checkbox).toBeChecked()
    
    // Should show completion timestamp
    await expect(page.getByText(/completed/i)).toBeVisible()
  })

  test('should add notes to checklist items', async ({ page, request }) => {
    await request.route('**/signoff-checklist/item1*', { method: 'PUT' }, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'item1',
          notes: 'Added detailed completion notes',
          completed_at: new Date().toISOString()
        })
      })
    })

    // Click on item to open notes section
    await page.getByText(/complete handover notes/i).click()

    // Add notes
    await page.getByLabel('Notes').fill('Item completed with detailed documentation')

    // Submit notes
    await page.getByRole('button', { name: /save notes/i }).click()

    await expect(page.getByText(/notes saved/i)).toBeVisible()
  })

  test('should filter checklist by category', async ({ page }) => {
    // Click category filter dropdown
    await page.getByRole('button', { name: /filter by category/i }).click()

    // Select Documentation category
    await page.getByText('Documentation').click()

    // Should only show documentation items
    await expect(page.getByText('Complete handover notes')).toBeVisible()
    await expect(page.getByText('Return company equipment')).not.toBeVisible()
  })

  test('should show completion progress', async ({ page }) => {
    // Should display progress indicator
    await expect(page.getByTestId('completion-progress')).toBeVisible()
    await expect(page.getByText(/3 of 5 items completed/i)).toBeVisible()

    // Progress bar should show correct percentage
    const progressBar = page.getByRole('progressbar')
    await expect(progressBar).toHaveAttribute('aria-valuenow', '60') // 3 of 5 = 60%
  })

  test('should generate signoff report', async ({ page, request }) => {
    // Mock report generation API
    await request.route('**/signoff/report/generate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('fake-signoff-report')
      })
    })

    // Click generate report button
    await page.getByRole('button', { name: /generate report/i }).click()

    // Should open modal with report options
    await expect(page.getByText(/generate signoff report/i)).toBeVisible()

    // Click generate PDF
    await page.getByRole('button', { name: /generate pdf/i }).click()

    // Should download report
    const downloadPromise = page.waitForEvent('download')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('signoff-report')
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('should validate required items before completion', async ({ page }) => {
    // Click finalize signoff button
    await page.getByRole('button', { name: /finalize signoff/i }).click()

    // Should show validation errors for incomplete required items
    await expect(page.getByText(/some required items are not completed/i)).toBeVisible()
    await expect(page.getByText(/complete these items:/i)).toBeVisible()

    // Should list incomplete required items
    await expect(page.getByText(/complete handover notes/i)).toBeVisible()
    await expect(page.getByText(/submit incident reports/i)).toBeVisible()
  })

  test('should successfully finalize signoff when all items complete', async ({ page, request }) => {
    // Mock completion of all required items
    await request.route('**/signoff-checklist*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'item1',
              item_text: 'Complete handover notes',
              category: 'Documentation',
              is_completed: true
            },
            {
              id: 'item2',
              item_text: 'Return company equipment',
              category: 'Equipment',
              is_completed: true
            },
            {
              id: 'item3',
              item_text: 'Submit incident reports',
              category: 'Safety',
              is_completed: true
            }
          ]
        })
      })
    })

    // Mock successful finalization
    await request.route('**/signoff/finalize', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          finalization_date: new Date().toISOString()
        })
      })
    })

    // Click finalize signoff
    await page.getByRole('button', { name: /finalize signoff/i }).click()

    // Should show success message
    await expect(page.getByText(/signoff finalized successfully/i)).toBeVisible()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should save draft automatically', async ({ page }) => {
    // Mock auto-save endpoint
    await request.route('**/signoff-checklist/save-draft', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    // Make changes to checklist
    await page.getByRole('checkbox', { name: /complete handover notes/i }).check()

    // Should show auto-saved indicator
    await expect(page.getByText(/auto-saved/i)).toBeVisible()
  })

  test('should handle offline mode', async ({ page, context }) => {
    // Simulate offline mode
    await context.route('**/*', route => route.abort())

    await page.click('[data-testid="offline-indicator"]')
    await expect(page.getByText(/you are offline/i)).toBeVisible()

    // Changes should be queued for sync
    await page.getByRole('checkbox', { name: /complete handover notes/i }).check()
    
    // Should show queued indicator
    await expect(page.getByText(/changes queued for sync/i)).toBeVisible()
  })

  test('should support bulk operations', async ({ page, request }) => {
    // Select multiple items
    await page.getByRole('checkbox', { name: /select all/i }).check()

    // Mock bulk completion API
    await request.route('**/signoff-checklist/bulk-complete', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          completed_items: ['item7', 'item8', 'item9']
        })
      })
    })

    // Click bulk complete button
    await page.getByRole('button', { name: /complete selected/i }).click()

    // Should show confirmation modal
    await expect(page.getByText(/complete 5 selected items?/i)).toBeVisible()

    // Confirm bulk completion
    await page.getByRole('button', { name: /confirm/i }).click()

    // Should show success message
    await expect(page.getByText(/5 items completed successfully/i)).toBeVisible()
  })

  test('should export checklist data', async ({ page, request }) => {
    // Mock export API
    await request.route('**/signoff-checklist/export/csv', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'ID,Item Text,Category,Status,Completed At\nitem1,Complete handover notes,Documentation,Completed,2024-01-01'
      })
    })

    // Click export button
    await page.getByRole('button', { name: /export/i }).click()
    await page.getByText(/export as csv/i).click()

    const downloadPromise = page.waitForEvent('download')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('signoff-checklist')
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('should handle concurrent edits', async ({ page, request }) => {
    // Mock concurrent modification error
    await request.route('**/signoff-checklist/item1*', { method: 'PUT' }, route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Conflict',
          message: 'Item has been modified by another user'
        })
      })
    })

    // Try to check an item that was modified by another user
    await page.getByRole('checkbox', { name: /complete handover notes/i }).check()

    // Should show conflict resolution modal
    await expect(page.getByText(/item has been modified/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /overwrite/i })).toBeVisible()
  })
})
