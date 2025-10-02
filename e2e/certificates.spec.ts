import { test, expect } from '@playwright/test'

test.describe('Certificates Management', () => {
  // Mock authenticated user state
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

    // Navigate to certificates page
    await page.goto('/certificates')
    await page.waitForLoadState('networkidle')
  })

  test('should display certificates list', async ({ page }) => {
    await expect(page.getByText(/certificates/i)).toBeVisible()
    
    // Check for table headers
    await expect(page.getByRole('columnheader', { name: /certificate name/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /type/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /expiry/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible()
  })

  test('should filter certificates by status', async ({ page, request }) => {
    // Mock API response for filtered certificates
    await request.route('**/certificates*', route => {
      if (route.request().url().includes('status=valid')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'cert1',
                certificate_name: 'Certificate of Competency',
                certificate_type: 'COC',
                expiry_date: '2024-12-31',
                status: 'valid',
                issuing_authority: 'Maritime Authority'
              }
            ]
          })
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'cert2',
                certificate_name: 'Expired Certificate',
                certificate_type: 'PSC',
                expiry_date: '2023-01-01',
                status: 'expired',
                issuing_authority: 'Flag State'
              }
            ]
          })
        })
      }
    })

    // Apply valid filter
    await page.getByRole('button', { name: /filter/i }).click()
    await page.getByLabel('Status').selectOption('valid')
    await page.getByRole('button', { name: /apply filter/i }).click()

    await expect(page.getByText('Certificate of Competency')).toBeVisible()
    await expect(page.getByText('Certificate of Competency')).not.toBeVisible()
  })

  test('should search certificates by name', async ({ page, request }) => {
    await request.route('**/certificates*', route => {
      if (route.request().url().includes('search=COC')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'cert1',
                certificate_name: 'Certificate of Competency',
                certificate_type: 'COC',
                expiry_date: '2024-12-31',
                status: 'valid'
              }
            ]
          })
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] })
        })
      }
    })

    // Search for certificates
    await page.getByPlaceholder(/search certificates/i).fill('COC')
    await page.getByRole('button', { name: /search/i }).click()

    await expect(page.getByText('Certificate of Competency')).toBeVisible()
  })

  test('should add new certificate', async ({ page, request }) => {
    // Mock successful certificate creation
    await request.route('**/certificates', { method: 'POST' }, route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-cert-id',
          certificate_name: 'New Certificate',
          certificate_type: 'GOC',
          issue_date: '2024-01-01',
          expiry_date: '2025-01-01',
          status: 'valid'
        })
      })
    })

    // Click add certificate button
    await page.getByRole('button', { name: /add certificate/i }).click()

    // Fill the form
    await page.getByLabel('Certificate Name').fill('New Certificate')
    await page.getByLabel('Type').selectOption('GOC')
    await page.getByLabel('Issue Date').fill('2024-01-01')
    await page.getByLabel('Expiry Date').fill('2025-01-01')
    await page.getByLabel('Issuing Authority').fill('Maritime Authority')

    await page.getByRole('button', { name: /save certificate/i }).click()

    // Should show success message
    await expect(page.getByText(/certificate added successfully/i)).toBeVisible()
  })

  test('should view certificate details', async ({ page, request }) => {
    // Mock certificate detail API
    await request.route('**/certificates/cert1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'cert1',
          certificate_name: 'Certificate of Competency',
          certificate_type: 'COC',
          issue_date: '2023-01-01',
          expiry_date: '2024-12-31',
          certificate_number: 'COC123',
          issuing_authority: 'Maritime Authority',
          status: 'valid',
          document_url: 'https://example.com/cert.pdf'
        })
      })
    })

    // Click on certificate row to view details
    await page.getByRole('row', { name: /certificate of competency/i }).click()

    // Should open detail modal or navigate to detail page
    await expect(page.getByText(/certificate details/i)).toBeVisible()
    await expect(page.getByText('COC123')).toBeVisible()
    await expect(page.getByText('Maritime Authority')).toBeVisible()
  })

  test('should edit existing certificate', async ({ page, request }) => {
    // Mock certificate data
    await request.route('**/certificates/cert1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'cert1',
          certificate_name: 'Certificate of Competency',
          certificate_type: 'COC',
          issue_date: '2023-01-01',
          expiry_date: '2024-12-31',
          status: 'valid'
        })
      })
    })

    // Mock successful update
    await request.route('**/certificates/cert1', { method: 'PUT' }, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    // Click edit button on certificate row
    await page.getByRole('row', { name: /certificate of competency/i }).getByRole('button', { name: /edit/i }).click()

    // Modify certificate
    await page.getByLabel('Certificate Name').fill('Updated Certificate Name')
    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByText(/certificate updated successfully/i)).toBeVisible()
  })

  test('should delete certificate with confirmation', async ({ page, request }) => {
    // Mock certificate data
    await request.route('**/certificates/cert1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'cert1',
          certificate_name: 'Certificate to Delete'
        })
      })
    })

    // Mock successful deletion
    await request.route('**/certificates/cert1', { method: 'DELETE' }, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    // Click delete button
    await page.getByRole('row', { name: /certificate to delete/i }).getByRole('button', { name: /delete/i }).click()

    // Confirm deletion in modal
    await expect(page.getByText(/are you sure/i)).toBeVisible()
    await page.getByRole('button', { name: /confirm delete/i }).click()

    await expect(page.getByText(/certificate deleted successfully/i)).toBeVisible()
  })

  test('should download certificate document', async ({ page, request }) => {
    // Mock certificate with document
    await request.route('**/certificates/cert1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'cert1',
          certificate_name: 'Certificate with Document',
          document_url: 'https://example.com/cert.pdf'
        })
      })
    })

    // Mock document download
    await request.route('**/documents/download/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('fake-pdf-content')
      })
    })

    // Click download button
    await page.getByRole('row', { name: /certificate with document/i }).getByRole('button', { name: /download/i }).click()

    // Should start download
    const downloadPromise = page.waitForEvent('download')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('should handle expiry warnings for soon-to-expire certificates', async ({ page, request }) => {
    await request.route('**/certificates*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'cert1',
              certificate_name: 'Soon to Expire Certificate',
              certificate_type: 'COC',
              expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
              status: 'valid'
            }
          ]
        })
      })
    })

    await page.goto('/certificates')

    // Should show warning indicator for soon-to-expire certificates
    await expect(page.getByTestId('expiry-warning')).toBeVisible()
    await expect(page.getByText(/expires in 15 days/i)).toBeVisible()
  })

  test('should export certificates to PDF', async ({ page, request }) => {
    await request.route('**/certificates/export/pdf', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('fake-certificates-pdf')
      })
    })

    // Click export button
    await page.getByRole('button', { name: /export/i }).click()
    await page.getByText(/export as pdf/i).click()

    const downloadPromise = page.waitForEvent('download')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('certificates')
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('should support pagination', async ({ page, request }) => {
    // Mock paginated data
    await request.route('**/certificates*', route => {
      const url = new URL(route.request().url())
      const page = url.searchParams.get('page') || '1'
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: Array.from({ length: 10 }, (_, i) => ({
            id: `cert${page}${i}`,
            certificate_name: `Certificate ${parseInt(page) * 10 + i}`,
            certificate_type: 'COC',
            expiry_date: '2024-12-31',
            status: 'valid'
          })),
          pagination: {
            current_page: parseInt(page),
            total_pages: 5,
            total_count: 50
          }
        })
      })
    })

    // Check pagination controls
    await expect(page.getByRole('button', { name: /next page/i })).toBeVisible()
    await expect(page.getByText(/page 1 of 5/i)).toBeVisible()

    // Navigate to next page
    await page.getByRole('button', { name: /next page/i }).click()
    await expect(page.getByText(/page 2 of 5/i)).toBeVisible()
  })

  ltest('should handle API errors gracefully', async ({ page, request }) => {
    // Mock API error
    await request.route('**/certificates*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error'
        })
      })
    })

    await page.goto('/certificates')

    // Should show error message
    await expect(page.getByText(/failed to load certificates/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})
