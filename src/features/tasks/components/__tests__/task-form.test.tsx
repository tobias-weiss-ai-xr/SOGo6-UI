import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode
    open?: boolean
  }) => (open ? <div data-testid="task-form-dialog">{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: () => null,
}))

jest.mock('@/features/calendars/components/event-form/attendee-input', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
  }: {
    value: Array<{ email: string; name?: string }>
    onChange: (v: Array<{ email: string; name?: string }>) => void
  }) => (
    <div data-testid="attendee-input">
      <span>{value.map((a) => a.email).join(',')}</span>
      <input
        data-testid="attendee-add"
        type="text"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            const email = (e.target as HTMLInputElement).value.trim()
            if (email) {
              onChange([...value, { email }])
              ;(e.target as HTMLInputElement).value = ''
            }
          }
        }}
      />
    </div>
  ),
}))

import TaskForm from '../task-form'

const calendars = [
  { key: 'cal-1', id: 'cal-1', name: 'Personal', description: null },
]

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders create form when open', () => {
      render(
        <TaskForm
          open
          calendars={calendars}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('task-form-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('task-form')).toBeInTheDocument()
      expect(screen.getByText('form.create_title.string')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <TaskForm
          open={false}
          calendars={calendars}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.queryByTestId('task-form-dialog')).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('shows edit title when task is provided', () => {
      render(
        <TaskForm
          open
          calendars={calendars}
          task={{
            id: 't1',
            key: 't1',
            title: 'Existing',
            calendar_key: 'cal-1',
          }}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByText('form.edit_title.string')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing')).toBeInTheDocument()
    })

    it('shows progress slider for in_process tasks', () => {
      render(
        <TaskForm
          open
          calendars={calendars}
          task={{
            id: 't1',
            key: 't1',
            title: 'In progress task',
            calendar_key: 'cal-1',
            status: 'in_process',
            percent_complete: 40,
          }}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('task-progress-field')).toBeInTheDocument()
      expect(screen.getByRole('slider')).toHaveValue('40')
    })
  })

  describe('integration', () => {
    it('submits create form', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      const onClose = jest.fn()
      render(
        <TaskForm
          open
          calendars={calendars}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )
      await user.type(screen.getByLabelText('form.title.string'), 'New task')
      await user.click(screen.getByRole('button', { name: 'form.save.string' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      expect(onClose).toHaveBeenCalled()
    })

    it('blocks submit when due is before start', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(
        <TaskForm
          open
          calendars={calendars}
          onClose={jest.fn()}
          onSubmit={onSubmit}
        />
      )
      await user.type(screen.getByLabelText('form.title.string'), 'New task')
      await user.type(
        screen.getByLabelText('form.date_start.string'),
        '2024-07-16T10:00'
      )
      await user.type(
        screen.getByLabelText('form.due.string'),
        '2024-07-15T10:00'
      )
      await user.click(screen.getByRole('button', { name: 'form.save.string' }))
      await waitFor(() => {
        expect(
          screen.getByText('form.errors.date_order.string')
        ).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits recurrence_rule when recurrence toggled on', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(
        <TaskForm
          open
          calendars={calendars}
          onClose={jest.fn()}
          onSubmit={onSubmit}
        />
      )
      await user.type(screen.getByLabelText('form.title.string'), 'Recurring')
      await user.click(screen.getByLabelText('repeat.string'))
      await user.click(screen.getByRole('button', { name: 'form.save.string' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      const { body } = onSubmit.mock.calls[0][0]
      expect(body.recurrence_rule).toEqual(
        expect.objectContaining({
          frequency: 'weekly',
          interval: 1,
          week_start: 'MO',
        })
      )
    })

    it('loads existing recurrence_rule into the editor', async () => {
      render(
        <TaskForm
          open
          calendars={calendars}
          task={{
            id: 't1',
            key: 't1',
            title: 'Recurring task',
            calendar_key: 'cal-1',
            recurrence_rule: {
              frequency: 'monthly',
              interval: 2,
              by_month_day: [14],
            },
          }}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      // Editing a recurring task keeps the recurrence switch on.
      expect(screen.getByLabelText('repeat.string')).toBeChecked()
    })

    it('loads existing attendees into the assignment field', async () => {
      render(
        <TaskForm
          open
          calendars={calendars}
          task={{
            id: 't1',
            key: 't1',
            title: 'Delegated task',
            calendar_key: 'cal-1',
            attendees: [
              { email: 'alice@example.org', name: 'Alice' },
              { email: 'bob@example.org' },
            ],
          }}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('attendee-input')).toHaveTextContent(
        'alice@example.org,bob@example.org'
      )
    })

    it('submits attendees as task assignment', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(
        <TaskForm
          open
          calendars={calendars}
          onClose={jest.fn()}
          onSubmit={onSubmit}
        />
      )
      await user.type(screen.getByLabelText('form.title.string'), 'Assign me')
      await user.type(
        screen.getByTestId('attendee-add'),
        'carol@example.org{enter}'
      )
      await user.click(screen.getByRole('button', { name: 'form.save.string' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      const { body } = onSubmit.mock.calls[0][0]
      expect(body.attendees).toEqual([
        { email: 'carol@example.org', name: undefined },
      ])
    })
  })
})
