// @ts-nocheck
import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock admin-panel-api mutations
jest.mock('@/features/admin-panel/store/admin-panel-api', () => ({
  useGenerateSpfRecordMutation: () => [
    jest.fn().mockResolvedValue({ data: { data: { record: { name: 'example.org', type: 'TXT', value: 'v=spf1 mx ~all', ttl: 3600, description: 'SPF record' } } } }),
    { isLoading: false },
  ],
  useValidateSpfRecordMutation: () => [
    jest.fn().mockResolvedValue({ data: { data: { valid: true, warnings: [], errors: [] } } }),
    { isLoading: false },
  ],
  useGenerateDkimRecordMutation: () => [
    jest.fn().mockResolvedValue({ data: { data: { record: { name: 'sogo._domainkey.example.org', type: 'TXT', value: 'v=DKIM1; k=ed25519; p=placeholder', ttl: 3600, selector: 'sogo', description: 'DKIM record' } } } }),
    { isLoading: false },
  ],
  useGenerateDmarcRecordMutation: () => [
    jest.fn().mockResolvedValue({ data: { data: { record: { name: '_dmarc.example.org', type: 'TXT', value: 'v=DMARC1; p=none; pct=100', ttl: 3600, description: 'DMARC record' } } } }),
    { isLoading: false },
  ],
  useValidateDmarcRecordMutation: () => [
    jest.fn().mockResolvedValue({ data: { data: { valid: true, warnings: [], errors: [] } } }),
    { isLoading: false },
  ],
}))

// Mock UI components
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) => (
    <div data-testid="tabs" data-default={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type }: any) => (
    <input value={value} onChange={(e) => onChange?.(e)} placeholder={placeholder} type={type} />
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <span />,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
}))

describe('DnsWizardPage', () => {
  it('renders title and description', async () => {
    const DnsWizardPage = (await import('../page')).default
    render(<DnsWizardPage />)

    expect(screen.getByText('AP_DNS_WIZARD.title.string')).toBeInTheDocument()
    expect(screen.getByText('AP_DNS_WIZARD.description.string')).toBeInTheDocument()
  })

  it('renders all tab triggers', async () => {
    const DnsWizardPage = (await import('../page')).default
    render(<DnsWizardPage />)

    expect(screen.getByTestId('tab-trigger-spf')).toBeInTheDocument()
    expect(screen.getByTestId('tab-trigger-dkim')).toBeInTheDocument()
    expect(screen.getByTestId('tab-trigger-dmarc')).toBeInTheDocument()
    expect(screen.getByTestId('tab-trigger-validate')).toBeInTheDocument()
  })

  it('renders SPF tab content with form fields', async () => {
    const DnsWizardPage = (await import('../page')).default
    render(<DnsWizardPage />)

    expect(screen.getByTestId('tab-content-spf')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example.org')).toBeInTheDocument()
  })

  it('renders DKIM tab content with form fields', async () => {
    const DnsWizardPage = (await import('../page')).default
    render(<DnsWizardPage />)

    expect(screen.getByTestId('tab-content-dkim')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('sogo')).toBeInTheDocument()
  })

  it('renders DMARC tab content with form fields', async () => {
    const DnsWizardPage = (await import('../page')).default
    render(<DnsWizardPage />)

    expect(screen.getByTestId('tab-content-dmarc')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('dmarc@example.org')).toBeInTheDocument()
  })

  it('renders validate tab content', async () => {
    const DnsWizardPage = (await import('../page')).default
    render(<DnsWizardPage />)

    expect(screen.getByTestId('tab-content-validate')).toBeInTheDocument()
    expect(screen.getByText('AP_DNS_WIZARD.validate.spf_title.string')).toBeInTheDocument()
    expect(screen.getByText('AP_DNS_WIZARD.validate.dmarc_title.string')).toBeInTheDocument()
  })
})
