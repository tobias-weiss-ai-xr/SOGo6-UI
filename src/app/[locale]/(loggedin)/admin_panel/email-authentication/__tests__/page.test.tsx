// @ts-nocheck
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
}))

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockDomains = [
  { name: 'example.org', description: 'Primary', is_active: true, created_at: '', updated_at: '' },
]

jest.mock('@/features/admin-panel/store/email-auth-api', () => ({
  useListEmailAuthDomainsQuery: () => ({
    data: { domains: mockDomains, total_count: 1 },
    isLoading: false,
    refetch: jest.fn(),
  }),
  useGetEmailAuthDomainStatusQuery: () => ({ data: { status: mockDomains } }),
  useListDkimConfigsQuery: () => ({ data: { dkim_configs: [] } }),
  useListDmarcPoliciesQuery: () => ({ data: { dmarc_policies: [] } }),
  useListSpfRecordsQuery: () => ({ data: { spf_records: [] } }),
  useAddEmailAuthDomainMutation: () => [jest.fn(), { isLoading: false }],
  useDeleteEmailAuthDomainMutation: () => [jest.fn(), { isLoading: false }],
  useGenerateDkimKeyPairMutation: () => [jest.fn(), { isLoading: false }],
  useSetDkimConfigMutation: () => [jest.fn(), { isLoading: false }],
  useRotateDkimKeysMutation: () => [jest.fn(), { isLoading: false }],
  useSetDmarcPolicyMutation: () => [jest.fn(), { isLoading: false }],
  useSetSpfConfigMutation: () => [jest.fn(), { isLoading: false }],
  useValidateDkimDnsMutation: () => [jest.fn(), { isLoading: false }],
  useValidateDmarcDnsMutation: () => [jest.fn(), { isLoading: false }],
  useValidateSpfDnsMutation: () => [jest.fn(), { isLoading: false }],
  useValidateAllDomainsMutation: () => [jest.fn(), { isLoading: false }],
  useTestEmailAuthMutation: () => [jest.fn(), { isLoading: false }],
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }) => (
    <button onClick={onClick} data-variant={variant}>{children}</button>
  ),
}))
jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}))
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }) => <span className={className}>{children}</span>,
}))
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div />,
}))
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }) => <div>{children}</div>,
  TabsList: ({ children }) => <div>{children}</div>,
  TabsTrigger: ({ children }) => <div>{children}</div>,
  TabsContent: ({ children }) => <div>{children}</div>,
}))
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: () => <div />,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
}))

describe('EmailAuthenticationPage', () => {
  it('renders configured domain', async () => {
    const Page = (await import('../page')).default
    render(<Page />)
    expect(screen.getAllByText('example.org').length).toBeGreaterThan(0)
  })
})