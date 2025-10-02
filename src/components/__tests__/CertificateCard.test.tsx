import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../test-utils/test-providers'
import { CertificateCard } from '../certificates/CertificateCard'
import { mockCertificate, mockExpiringCertificate, mockExpiredCertificate } from '@/test-utils/test-data'

describe('CertificateCard', () => {
  const mockOnView = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnDownload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Default Variant', () => {
    it('renders certificate information correctly', () => {
      const certificate = mockCertificate()
      render(
        <CertificateCard
          certificate={certificate}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByText(certificate.certificate_name)).toBeInTheDocument()
      expect(screen.getByText(certificate.issuing_authority!)).toBeInTheDocument()
      expect(screen.getByText(certificate.certificate_type)).toBeInTheDocument()
      expect(screen.getByText(certificate.certificate_number!)).toBeInTheDocument()
      expect(screen.getByText('View Details')).toBeInTheDocument()
    })

    it('calls onView when View Details is clicked', () => {
      const certificate = mockCertificate()
      render(
        <CertificateCard
          certificate={certificate}
          onView={mockOnView}
        />
      )

      fireEvent.click(screen.getByText('View Details'))
      expect(mockOnView).toHaveBeenCalledWith(certificate)
    })

    it('shows download button when document_url is available', () => {
      const certificate = mockCertificate({ document_url: 'https://example.com/doc.pdf' })
      render(
        <CertificateCard
          certificate={citizen}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
    })

    it('calls onDownload when download button is clicked', () => {
      const certificate = mockCertificate({ document_url: 'https://example.com/doc.pdf' })
      render(
        <CertificateCard
          certificate={certificate}
          onDownload={mockOnDownload}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /download/i }))
      expect(mockOnDownload).toHaveBeenCalledWith(certificate)
    })
  })

  describe('Compact Variant', () => {
    it('renders in compact mode', () => {
      const certificate = mockCertificate()
      render(
        <CertificateCard
          certificate={certificate}
          variant="compact"
          onView={mockOnView}
        />
      )

      expect(screen.getByText(certificate.certificate_name)).toBeInTheDocument()
      expect(screen.getByText(certificate.issuing_authority!)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
    })

    it('renders certificate status badge', () => {
      const certificate = mockExpiredCertificate()
      render(
        <CertificateCard
          certificate={certificate}
          variant="compact"
        />
      )

      // The status badge should be present
      expect(screen.getByTestId('certificate-status-badge')).toBeInTheDocument()
    })
  })

  describe('Detailed Variant', () => {
    it('renders all action buttons', () => {
      const certificate = mockCertificate({ document_url: 'https://example.com/doc.pdf' })
      render(
        <CertificateCard
          certificate={certificate}
          variant="detailed"
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDownload={mockOnDownload}
        />
      )

      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('calls correct handlers when action buttons are clicked', () => {
      const certificate = mockCertificate()
      render(
        <CertificateCard
          certificate={certificate}
          variant="detailed"
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /view/i }))
      expect(mockOnView).toHaveBeenCalledWith(certificate)

      fireEvent.click(screen.getByRole('button', { name: /edit/i }))
      expect(mockOnEdit).toHaveBeenCalledWith(certificate)

      fireEvent.click(screen.getByRole('button', { name: /delete/i }))
      expect(mockOnDelete).toHaveBeenCalledWith(certificate)
    })
  })

  describe('Certificate Status', () => {
    it('shows expiry countdown for valid certificates', () => {
      const certificate = mockExpiringCertificate()
      render(<CertificateCard certificate={certificate} />)

      // Should show some form of countdown or expiry info
      expect(screen.getByText(/days? left|expire/i)).toBeInTheDocument()
    })

    it('handles expired certificates gracefully', () => {
      const certificate = mockExpiredCertificate()
      render(<CertificateCard certificate={certificate} />)

      expect(screen.getByText(/overdue|expired/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      const certificate = mockCertificate()
      render(
        <CertificateCard
          certificate={certificate}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDownload={mockOnDownload}
        />
      )

      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })

    it('supports keyboard navigation', () => {
      const certificate = mockCertificate()
      render(
        <CertificateCard
          certificate={certificate}
          variant="detailed"
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      )

      // Focus first button and navigate with Tab
      const firstButton = screen.getByRole('button', { name: /view/i })
      firstButton.focus()
      expect(firstButton).toHaveFocus()

      fireEvent.keyDown(firstButton, { key: 'Tab', code: 'Tab' })
      expect(screen.getByRole('button', { name: /edit/i })).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing certificate_number gracefully', () => {
      const certificate = mockCertificate({ certificate_number: undefined })
      render(<CertificateCard certificate={certificate} />)

      expect(screen.queryByText(/#/)).not.toBeInTheDocument()
    })

    it('handles missing issuing_authority gracefully', () => {
      const certificate = mockCertificate({ issuing_authority: undefined })
      render(<CertificateCard certificate={certificate} />)

      expect(screen.getByText(/issuing authority/i) || 
             screen.getByText(/unknown/i)).toBeInTheDocument()
    })

    it('handles missing action handlers gracefully', () => {
      const certificate = mockCertificate()
      render(<CertificateCard certificate={certificate} />)

      // Should render without crashing even without action handlers
      expect(screen.getByText(certificate.certificate_name)).toBeInTheDocument()
    })
  })
})
