// @ts-nocheck
import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next/navigation (useRouter)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock admin-panel-api
const mockResources = [
  {
    id: 'res-1',
    name: 'Conference Room A',
    description: 'Ground floor',
    email: 'room-a@example.org',
    resource_type: 'room',
    capacity: 20,
    location: 'Building A',
    features: ['projector'],
    is_active: true,
    booking_policy: 'open',
    allowed_groups: [],
    auto_accept: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

jest.mock('@/features/admin-panel/store/admin-panel-api', () => ({
  useGetResourcesQuery: () => ({
    // Admin API returns the Resource[] directly (no wrapper)
    data: mockResources,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useCreateResourceMutation: () => [jest.fn(), { isLoading: false }],
  useUpdateResourceMutation: () => [jest.fn(), { isLoading: false }],
  useDeleteResourceMutation: () => [jest.fn(), { isLoading: false }],
}))

// Mock UI components
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

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div className={className} />,
}))

describe('ResourcesPage', () => {
  it('renders title and description', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('Resource Management')).toBeInTheDocument()
    expect(screen.getByText('Manage meeting rooms, equipment, and vehicles')).toBeInTheDocument()
  })

  it('renders resource table with data', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('Conference Room A')).toBeInTheDocument()
    expect(screen.getByText('Ground floor')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('Building A')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders Add Resource button', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('Create Resource')).toBeInTheDocument()
  })

  it('renders table headers', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getAllByText('Type').length).toBeGreaterThan(0)
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Capacity')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })
})
