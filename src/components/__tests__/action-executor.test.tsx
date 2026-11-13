/**
 * Tests for the assistant action executor.
 * User-reviewed execution: never auto-executes, only on click.
 */
import type { AgentEnvelope, AssistantAction } from '@/lib/api/endpoints/agent'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ActionExecutor } from '../assistant/action-executor'

// next-intl: return the last path segment so assertions can match labels
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key.split('.').pop() ?? key,
}))

const executeMock = jest.fn()

jest.mock('@/lib/api/endpoints/agent', () => ({
  ...jest.requireActual('@/lib/api/endpoints/agent'),
  agentApi: { execute: (a: AssistantAction) => executeMock(a) },
}))

const sendDraft: AssistantAction = {
  id: 'mail.send',
  params: {
    from: 'max@example.org',
    to: ['boss@example.org'],
    subject: 'Report',
    body: 'See attached.',
  },
  summary: 'Send "Report" to boss@example.org',
}

function envelope(error_code = 'S000000'): AgentEnvelope {
  return {
    error_code,
    error_msg: error_code === 'S000000' ? '' : 'boom',
    data: null,
  }
}

describe('ActionExecutor', () => {
  beforeEach(() => {
    executeMock.mockReset()
  })

  it('renders the action for review without executing', () => {
    executeMock.mockResolvedValue(envelope())
    render(<ActionExecutor action={sendDraft} />)
    expect(screen.getByTestId('assistant-action')).toBeInTheDocument()
    expect(
      screen.getByText(/Send "Report" to boss@example.org/)
    ).toBeInTheDocument()
    expect(executeMock).not.toHaveBeenCalled()
  })

  it('executes only after explicit user click', async () => {
    executeMock.mockResolvedValue(envelope())
    render(<ActionExecutor action={sendDraft} />)

    fireEvent.click(screen.getByTestId('assistant-action-execute'))
    await waitFor(() =>
      expect(screen.getByTestId('assistant-action-result')).toHaveTextContent(
        'success'
      )
    )
    expect(executeMock).toHaveBeenCalledWith(sendDraft)
  })

  it('surfaces facade error codes (e.g. scope S000513)', async () => {
    executeMock.mockResolvedValue(envelope('S000513'))
    render(<ActionExecutor action={sendDraft} />)

    fireEvent.click(screen.getByTestId('assistant-action-execute'))
    await waitFor(() =>
      expect(screen.getByTestId('assistant-action-result')).toHaveTextContent(
        'S000513'
      )
    )
  })

  it('stays retryable after a facade error', async () => {
    executeMock.mockResolvedValue(envelope('S000513'))
    render(<ActionExecutor action={sendDraft} />)

    fireEvent.click(screen.getByTestId('assistant-action-execute'))
    await waitFor(() =>
      expect(screen.getByTestId('assistant-action-result')).toHaveTextContent(
        'S000513'
      )
    )
    expect(screen.getByTestId('assistant-action-execute')).toBeEnabled()
  })

  it('disables the button after a successful execution', async () => {
    executeMock.mockResolvedValue(envelope())
    render(<ActionExecutor action={sendDraft} />)

    fireEvent.click(screen.getByTestId('assistant-action-execute'))
    await waitFor(() =>
      expect(screen.getByTestId('assistant-action-result')).toHaveTextContent(
        'success'
      )
    )
    expect(screen.getByTestId('assistant-action-execute')).toBeDisabled()
  })

  it('reports transport failures without crashing', async () => {
    executeMock.mockRejectedValue(new Error('network down'))
    render(<ActionExecutor action={sendDraft} />)

    fireEvent.click(screen.getByTestId('assistant-action-execute'))
    await waitFor(() =>
      expect(screen.getByTestId('assistant-action-result')).toHaveTextContent(
        'network down'
      )
    )
  })

  it('shows the parameter payload on demand', () => {
    render(<ActionExecutor action={sendDraft} />)
    expect(
      screen.queryByTestId('assistant-action-params')
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('assistant-action-toggle-params'))
    expect(screen.getByTestId('assistant-action-params')).toHaveTextContent(
      'boss@example.org'
    )
  })

  it('notifies onExecuted with the envelope', async () => {
    executeMock.mockResolvedValue(envelope())
    const onExecuted = jest.fn()
    render(<ActionExecutor action={sendDraft} onExecuted={onExecuted} />)

    fireEvent.click(screen.getByTestId('assistant-action-execute'))
    await waitFor(() => expect(onExecuted).toHaveBeenCalled())
    expect(onExecuted.mock.calls[0][0].error_code).toBe('S000000')
  })
})
