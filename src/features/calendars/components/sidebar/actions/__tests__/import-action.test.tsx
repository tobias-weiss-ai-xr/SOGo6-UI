import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import React from 'react'

const mockImportCalendar = jest.fn(() => ({
  unwrap: () => Promise.resolve({ job_id: 'job-42' }),
}))
const mockOnJobSuccess = jest.fn()

jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useImportCalendarMutation: jest.fn(() => [
    mockImportCalendar,
    { isLoading: false },
  ]),
}))

jest.mock(
  '@/features/jobs',
  () => ({
    useJobPolling: (jobId: string | null, options?: unknown) => {
      // Capture the success callback so the test can drive the job to done.
      const opts = (options ?? {}) as { onSuccess?: () => void }
      if (opts.onSuccess) mockOnJobSuccess.mockImplementation(opts.onSuccess)
      return { isPolling: Boolean(jobId), isFailure: false, isSuccess: false }
    },
  }),
  { virtual: false }
)

import ImportAction from '../import-action'

describe('ImportAction', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dialog title', () => {
    render(<ImportAction id="cal-1" name="My Calendar" onClose={onClose} />)

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'sidebar.import.string'
    )
  })

  it('is disabled until a file is chosen, then imports with the file', async () => {
    render(<ImportAction id="cal-1" name="My Calendar" onClose={onClose} />)

    const importButton = screen.getByRole('button', {
      name: /sidebar\.import\.string/,
    })
    expect(importButton).toBeDisabled()

    const file = new File(['BEGIN:VCALENDAR'], 'events.ics', {
      type: 'text/calendar',
    })
    const input = screen.getByTestId('calendar-import-input')
    fireEvent.change(input, { target: { files: [file] } })

    const chooser = await screen.findByRole('button', {
      name: /events\.ics/,
    })
    expect(chooser).toBeInTheDocument()

    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockImportCalendar).toHaveBeenCalledWith({
        key: 'cal-1',
        file,
      })
    })
  })

  it('shows success and auto-closes when the import job completes', async () => {
    render(<ImportAction id="cal-1" name="My Calendar" onClose={onClose} />)

    const file = new File(['BEGIN:VCALENDAR'], 'events.ics', {
      type: 'text/calendar',
    })
    fireEvent.change(screen.getByTestId('calendar-import-input'), {
      target: { files: [file] },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /sidebar\.import\.string/ })
    )

    await waitFor(() => {
      expect(mockImportCalendar).toHaveBeenCalled()
    })

    // Drive the job to success via the captured onSuccess callback.
    act(() => {
      mockOnJobSuccess()
    })

    expect(
      await screen.findByText('sidebar.import.success.string')
    ).toBeInTheDocument()

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )
  })
})
