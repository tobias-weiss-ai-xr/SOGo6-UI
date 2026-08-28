import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import React from 'react'

const mockEnableSubscription = jest.fn(() => ({
  unwrap: () =>
    Promise.resolve({
      share_token: 'tok-abc',
      public_url: 'http://localhost/public/calendars/tok-abc',
    }),
}))
const mockDisableSubscription = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useEnableSubscriptionMutation: jest.fn(() => [
    mockEnableSubscription,
    { isLoading: false },
  ]),
  useDisableSubscriptionMutation: jest.fn(() => [
    mockDisableSubscription,
    { isLoading: false },
  ]),
  useGetCalendarByIdQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
  })),
}))

import { useGetCalendarByIdQuery } from '@/features/calendars/store/calendars-api'

// jest.mock above replaces the module; the hook resolves to the jest.fn at runtime
const mockUseGetCalendarByIdQuery = useGetCalendarByIdQuery as jest.Mock

import LinkAction from '../link'

describe('LinkAction', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetCalendarByIdQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    })
  })

  it('renders the dialog title', () => {
    render(<LinkAction id="cal-1" onClose={onClose} />)

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'sidebar.link.string'
    )
  })

  it('shows an enable button when the calendar has no subscription', () => {
    mockUseGetCalendarByIdQuery.mockReturnValue({
      data: { share_token: null },
      isLoading: false,
    })

    render(<LinkAction id="cal-1" onClose={onClose} />)

    expect(
      screen.getByRole('button', { name: 'sidebar.link.string' })
    ).toBeInTheDocument()
  })

  it('shows the share URL and a revoke button when the calendar already has a share_token', () => {
    mockUseGetCalendarByIdQuery.mockReturnValue({
      data: { share_token: 'existing-token' },
      isLoading: false,
    })

    render(<LinkAction id="cal-1" onClose={onClose} />)

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'sidebar.link.string'
    )
    // Readonly input displays the public subscription URL
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toContain('/public/calendars/existing-token')
    // Destructive button revokes the subscription
    expect(
      screen.getByRole('button', { name: 'sidebar.link.string' })
    ).toHaveClass('bg-destructive')
  })

  it('calls the enable mutation with the calendar id and shows the returned public URL', async () => {
    mockUseGetCalendarByIdQuery.mockReturnValue({
      data: { share_token: null },
      isLoading: false,
    })

    render(<LinkAction id="cal-1" onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'sidebar.link.string' }))

    await waitFor(() => {
      expect(mockEnableSubscription).toHaveBeenCalledWith('cal-1')
    })

    const input = (await screen.findByRole('textbox')) as HTMLInputElement
    expect(input.value).toBe('http://localhost/public/calendars/tok-abc')
  })

  it('calls the disable mutation and closes the dialog when revoked', async () => {
    mockUseGetCalendarByIdQuery.mockReturnValue({
      data: { share_token: 'existing-token' },
      isLoading: false,
    })

    render(<LinkAction id="cal-1" onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'sidebar.link.string' }))

    await waitFor(() => {
      expect(mockDisableSubscription).toHaveBeenCalledWith('cal-1')
    })
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})
