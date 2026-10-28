import { render, screen, waitFor } from '@testing-library/react'
import SmimeForm from '../smime-form'

// Mock next-intl: resolve params so expiry day counts render
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}))

// Mock the auth slice
jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: () => 'test-jwt',
}))

const mockFetch = jest.fn()
global.fetch = mockFetch as unknown as typeof fetch

function mockCertResponse(cert: object | null) {
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ data: { certificate: cert } }),
  })
}

describe('SmimeForm expiry warning', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('warns red when the certificate is expired', async () => {
    mockCertResponse({
      subject_cn: 'Old Cert',
      not_after: '2020-01-01T00:00:00+00:00',
      expired: true,
      days_until_expiry: -500,
      fingerprint_sha256: 'ab',
      self_signed: true,
    })
    render(<SmimeForm />)
    await waitFor(() =>
      expect(screen.getByText(/smime.expired/)).toBeInTheDocument()
    )
    expect(screen.queryByText(/smime.expiresSoon/)).not.toBeInTheDocument()
  })

  it('warns amber when the certificate expires within 30 days', async () => {
    mockCertResponse({
      subject_cn: 'Soon Cert',
      not_after: new Date(Date.now() + 10 * 86400_000).toISOString(),
      expired: false,
      days_until_expiry: 10,
      fingerprint_sha256: 'cd',
      self_signed: false,
    })
    render(<SmimeForm />)
    await waitFor(() =>
      expect(screen.getByText(/smime.expiresSoon/)).toBeInTheDocument()
    )
    expect(
      JSON.parse(
        screen
          .getByText(/smime.expiresSoon/)
          .textContent!.replace(/^smime.expiresSoon:/, '')
      )['days']
    ).toBe(10)
    expect(screen.queryByText(/smime.expired/)).not.toBeInTheDocument()
  })

  it('shows no warning for a certificate valid for over 30 days', async () => {
    mockCertResponse({
      subject_cn: 'Fine Cert',
      not_after: new Date(Date.now() + 365 * 86400_000).toISOString(),
      expired: false,
      days_until_expiry: 365,
      fingerprint_sha256: 'ef',
      self_signed: false,
    })
    render(<SmimeForm />)
    await waitFor(() =>
      expect(screen.getByText('Fine Cert')).toBeInTheDocument()
    )
    expect(screen.queryByText(/smime.expired/)).not.toBeInTheDocument()
    expect(screen.queryByText(/smime.expiresSoon/)).not.toBeInTheDocument()
  })
})
