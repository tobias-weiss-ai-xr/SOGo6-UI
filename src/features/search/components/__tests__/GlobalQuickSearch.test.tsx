// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock the global search store
const mockSearchData = {
  contacts: [
    {
      key: 'c1',
      addressbook_key: 'ab1',
      fullname: 'Alice Doe',
      email: 'alice@example.org',
    },
  ],
  events: [
    {
      key: 'e1',
      calendar_key: 'cal1',
      title: 'Weekly sync',
      date_start: '2026-08-10T09:00:00Z',
      date_end: '2026-08-10T10:00:00Z',
    },
  ],
  users: [
    { uid: 'bob', cn: 'Bob Martin', mail: 'bob@example.org' },
  ],
}

jest.mock('@/features/search/store/global-search-api', () => ({
  useGlobalSearchQuery: jest.fn(() => ({
    data: mockSearchData,
    isFetching: false,
  })),
}))

// Mock router
const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock the command UI components so the dialog renders inline
jest.mock('@/components/ui/command', () => {
  const React = require('react')
  return {
    CommandDialog: ({ children, open }: any) =>
      open ? <div data-testid="command-dialog">{children}</div> : null,
    CommandInput: ({ placeholder, value, onValueChange }: any) => (
      <input
        data-testid="command-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
    ),
    CommandList: ({ children }: any) => <div data-testid="command-list">{children}</div>,
    CommandEmpty: ({ children }: any) => <div data-testid="command-empty">{children}</div>,
    CommandGroup: ({ children, heading }: any) => (
      <div data-testid="command-group">
        <div data-testid="command-heading">{heading}</div>
        {children}
      </div>
    ),
    CommandItem: ({ children, onSelect }: any) => (
      <button data-testid="command-item" onClick={onSelect}>
        {children}
      </button>
    ),
    CommandSeparator: () => <hr />,
  }
})

const GlobalQuickSearch = require('../GlobalQuickSearch').default

describe('GlobalQuickSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('opens the dialog with Cmd+K', async () => {
    const user = userEvent.setup()
    render(<GlobalQuickSearch />)
    expect(screen.queryByTestId('command-dialog')).not.toBeInTheDocument()

    await user.keyboard('{Control>}k{/Control}')
    expect(screen.getByTestId('command-dialog')).toBeInTheDocument()
  })

  it('renders navigation items when opened', async () => {
    const user = userEvent.setup()
    render(<GlobalQuickSearch />)
    await user.keyboard('{Control>}k{/Control}')

    expect(screen.getByText('goToInbox')).toBeInTheDocument()
    expect(screen.getByText('goToMail')).toBeInTheDocument()
    expect(screen.getByText('goToContacts')).toBeInTheDocument()
    expect(screen.getByText('goToCalendar')).toBeInTheDocument()
    expect(screen.getByText('goToSettings')).toBeInTheDocument()
  })

  it('shows grouped search results after typing a query', async () => {
    const user = userEvent.setup()
    render(<GlobalQuickSearch />)
    await user.keyboard('{Control>}k{/Control}')

    const input = screen.getByTestId('command-input')
    fireEvent.change(input, { target: { value: 'ali' } })

    // Debounce — wait for the query to propagate
    await new Promise((r) => setTimeout(r, 300))

    expect(screen.getByText('contactsHeading')).toBeInTheDocument()
    expect(screen.getByText('Alice Doe')).toBeInTheDocument()
    expect(screen.getByText('calendarHeading')).toBeInTheDocument()
    expect(screen.getByText('Weekly sync')).toBeInTheDocument()
    expect(screen.getByText('usersHeading')).toBeInTheDocument()
    expect(screen.getByText('Bob Martin')).toBeInTheDocument()
  })

  it('navigates to contacts when a contact result is selected', async () => {
    const user = userEvent.setup()
    render(<GlobalQuickSearch />)
    await user.keyboard('{Control>}k{/Control}')

    const input = screen.getByTestId('command-input')
    fireEvent.change(input, { target: { value: 'ali' } })
    await new Promise((r) => setTimeout(r, 300))

    const item = screen.getAllByTestId('command-item').find(
      (el: HTMLElement) => el.textContent?.includes('Alice Doe')
    )
    fireEvent.click(item)
    expect(mockPush).toHaveBeenCalledWith('/address_books/ab1/@visualization/c1')
  })
})
