import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import React from 'react'

const mockExportCalendar = jest.fn(() => ({
  unwrap: () => Promise.resolve({ job_id: 'job-42' }),
}))
const mockFetchJobResult = jest.fn(() => ({
  unwrap: () =>
    Promise.resolve({
      contentDisposition: '',
      blob: new Blob(['BEGIN:VCALENDAR'], { type: 'text/calendar' }),
    }),
}))

jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useExportCalendarMutation: jest.fn(() => [
    mockExportCalendar,
    { isLoading: false },
  ]),
}))

jest.mock('@/features/jobs', () => ({
  useJobPolling: jest.fn(() => ({
    isPolling: false,
    isFailure: false,
    isSuccess: false,
  })),
}))

jest.mock('@/features/jobs/store/jobs-api', () => ({
  useLazyGetJobResultQuery: jest.fn(() => [mockFetchJobResult]),
}))

jest.mock('@/features/jobs/utils/download-job-result', () => ({
  downloadBlobAsFile: jest.fn(),
  filenameFromContentDisposition: jest.fn(
    (_cd: string | null, fallback: string) => fallback
  ),
}))

import ExportAction from '../export'

describe('ExportAction', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dialog title', () => {
    render(<ExportAction id="cal-1" name="My Calendar" onClose={onClose} />)

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'sidebar.export.string'
    )
  })

  it('calls the export mutation with the calendar key when clicked', async () => {
    render(<ExportAction id="cal-1" name="My Calendar" onClose={onClose} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'sidebar.export.string' })
    )

    await waitFor(() => {
      expect(mockExportCalendar).toHaveBeenCalledWith({ key: 'cal-1' })
    })
  })
})
