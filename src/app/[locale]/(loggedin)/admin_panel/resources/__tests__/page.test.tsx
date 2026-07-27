// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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

vi.mock('@/features/admin-panel/store/admin-panel-api', () => ({
  useGetResourcesQuery: () => ({
    data: mockResources,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateResourceMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateResourceMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteResourceMutation: () => [vi.fn(), { isLoading: false }],
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type }: any) => (
    <input value={value} onChange={(e) => onChange?.(e)} placeholder={placeholder} type={type} />
  ),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}))

vi.mock('@/components/ui/select', () => ({
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

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div className={className} />,
}))

describe('ResourcesPage', () => {
  it('renders title and description', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('AP_RESOURCES.title.string')).toBeInTheDocument()
    expect(screen.getByText('AP_RESOURCES.description.string')).toBeInTheDocument()
  })

  it('renders resource table with data', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('Conference Room A')).toBeInTheDocument()
    expect(screen.getByText('room-a@example.org')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('Building A')).toBeInTheDocument()
  })

  it('renders Add Resource button', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('AP_RESOURCES.create.button.string')).toBeInTheDocument()
  })

  it('renders table headers', async () => {
    const ResourcesPage = (await import('../page')).default
    render(<ResourcesPage />)

    expect(screen.getByText('AP_RESOURCES.table.name.string')).toBeInTheDocument()
    expect(screen.getByText('AP_RESOURCES.table.type.string')).toBeInTheDocument()
    expect(screen.getByText('AP_RESOURCES.table.policy.string')).toBeInTheDocument()
    expect(screen.getByText('AP_RESOURCES.table.status.string')).toBeInTheDocument()
  })
})
