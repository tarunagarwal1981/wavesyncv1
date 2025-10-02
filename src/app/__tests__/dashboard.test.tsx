import React from 'react'
import { render, screen, waitFor, fireEvent } from '../../../test-utils/test-providers'
import { mockDashboardData } from '@/test-utils/test-data'
import DashboardPage from '../dashboard/page'

// Mock the dashboard service
jest.mock('@/lib/dashboard-service', () => ({
  fetchDashboardData: jest.fn(),
  refreshDashboardData: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}))

// Mock the dashboard service
const mockFetchDashboardData = require('@/lib/dashboard-service').fetchDashboardData as jest.MockedFunction<any>
const mockRefreshDashboardData = require('@/lib/dashboard-service').refreshDashboardData as jest.MockedFunction<any>

describe('Dashboard Page', () => {
  const mockData = mockDashboardData()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful data fetch
    mockFetchDashboardData.mockResolvedValue({
      data: mockData,
      error: null,
    })
  })

  it('renders dashboard page with loading state initially', async () => {
    // Mock async data loading
    mockFetchDashboardData.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: mockData, error: null }), 100))
    )

    render(<DashboardPage />)

    // Should show loading state
    expect(screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('displays user information correctly', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(mockData.user.profiles.full_name)).toBeInTheDocument()
      expect(screen.getByText(mockData.user.profiles.rank)).toBeInTheDocument()
      expect(screen.getByText(mockData.user.profiles.employee_id)).toBeInTheDocument()
    })
  })

  it('displays dashboard statistics', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(mockData.status.pendingTasks.toString())).toBeInTheDocument()
      expect(screen.getByText(mockData.status.expiringCertificates.toString())).toBeInTheDocument()
      expect(screen.getByText(mockData.status.unreadCirculars.toString())).toBeInTheDocument()
    })
  })

  it('displays active assignment when available', async () => {
    const mockDataWithAssignment = mockDashboardData({
      activeAssignment: {
        vessel_name: 'Test Vessel',
        vessel_type: 'Container',
        flag: 'Liberia',
        expected_signoff_date: '2024-02-01',
      },
    })

    mockFetchDashboardData.mockResolvedValue({
      data: mockDataWithAssignment,
      error: null,
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(mockDataWithAssignment.activeAssignment.vessel_name)).toBeInTheDocument()
      expect(screen.getByText(mockDataWithAssignment.activeAssignment.vessel_type)).toBeInTheDocument()
      expect(screen.getByText(mockDataWithAssignment.activeAssignment.flag)).toBeInTheDocument()
    })
  })

  it('displays recent circulars', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      // Should show at least one circular
      expect(screen.getAllByText(/circular/i).length).toBeGreaterThan(0)
      
      // Should show circular priorities
      const priorities = ['urgent', 'high', 'medium', 'low']
      priorities.forEach(priority => {
        if (mockData.recentCirculars.some(c => c.priority === priority)) {
          expect(screen.getByText(new RegExp(priority, 'i'))).toBeInTheDocument()
        }
      })
    })
  })

  it('displays recent certificates', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      mockData.recentCertificates.forEach(certificate => {
        expect(screen.getByText(certificate.certificate_name)).toBeInTheDocument()
        expect(screen.getByText(certificate.issuing_authority)).toBeInTheDocument()
      })
    })
  })

  it('displays upcoming items', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      mockData.upcomingItems.forEach(item => {
        expect(screen.getByText(item.title)).toBeInTheDocument()
        expect(screen.getByText(item.description)).toBeInTheDocument()
      })
    })
  })

  it('handles refresh button click', async () => {
    mockRefreshDashboardData.mockResolvedValue({
      data: mockData,
      error: null,
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(mockRefreshDashboardData).toHaveBeenCalledTimes(1)
    })
  })

  it('handles error state gracefully', async () => {
    mockFetchDashboardData.mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch dashboard data' },
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })

  it('handles retry on error', async () => {
    // First call fails
    mockFetchDashboardData
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to fetch dashboard data' },
      })
      .mockResolvedValueOnce({
        data: mockData,
        error: null,
      })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(mockFetchDashboardData).toHaveBeenCalledTimes(2)
      expect(screen.getByText(mockData.user.profiles.full_name)).toBeInTheDocument()
    })
  })

  it('displays upcoming travel when available', async () => {
    const mockDataWithTravel = mockDashboardData({
      stats: {
        ...mockData.stats,
        upcomingTravel: new Date('2024-02-01'),
      },
    })

    mockFetchDashboardData.mockResolvedValue({
      data: mockDataWithTravel,
      error: null,
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/upcoming travel/i)).toBeInTheDocument()
      expect(screen.getByText(/2024-02-01/i)).toBeInTheDocument()
    })
  })

  it('handles empty dashboard data', async () => {
    const emptyData = mockDashboardData({
      upcomingItems: [],
      recentCirculars: [],
      recentCertificates: [],
      stats: {
        pendingTasks: 0,
        expiringCertificates: 0,
        unreadCirculars: 0,
      },
    })

    mockFetchDashboardData.mockResolvedValue({
      data: emptyData,
      error: null,
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/no upcoming items/i)).toBeInTheDocument()
      expect(screen.getByText(/no recent circulars/i)).toBeInTheDocument()
    })
  })

  it('supports mobile responsive design', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<DashboardPage />)

    await waitFor(() => {
      // Should use mobile-optimized components
      expect(screen.getByTestId('mobile-dashboard') || screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })
})
