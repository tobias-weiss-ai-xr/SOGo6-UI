import { act, renderHook } from '@testing-library/react'
import { closeDraft } from '../../store'
import { MAIL_PRIORITY_NORMAL } from '../../store/mail-compose-slice'

const mockDispatch = jest.fn()
const mockSendMail = jest.fn()
const mockCancelPendingSend = jest.fn()
const mockUseSendMailMutation = jest.fn()
const mockBuildComposeMailPayload = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('../../store/mail-api', () => ({
  useSendMailMutation: () => mockUseSendMailMutation(),
  useCancelPendingSendMutation: () => [mockCancelPendingSend],
}))

jest.mock('../../utils/build-compose-mail-payload', () => ({
  buildComposeMailPayload: (...args: unknown[]) =>
    mockBuildComposeMailPayload(...args),
}))

import { useComposeSend } from '../use-compose-send'

const baseFields = {
  draftId: 'draft-1',
  accountId: 'acc-1',
  mailKey: null as string | null,
  selectedIdentity: { mail: 'me@sogo.nu', replyTo: '' } as any,
  toRecipients: [{ email: 'to@sogo.nu' }],
  ccRecipients: [],
  bccRecipients: [],
  subject: 'Subject',
  body: 'Body',
  requestReadReceipt: false,
  selectedPriority: MAIL_PRIORITY_NORMAL as 0 | 1 | 2 | 3 | 4,
  isPlainText: false,
}

describe('useComposeSend', () => {
  beforeEach(() => {
    mockUseSendMailMutation.mockReturnValue([mockSendMail, { isLoading: false }])
    mockSendMail.mockResolvedValue({ data: {} })
    mockBuildComposeMailPayload.mockReturnValue({ mocked: 'payload' })
  })

  it('shows the no-recipient alert and does not send when there are no recipients', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, toRecipients: [] })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.showNoRecipientAlert).toBe(true)
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('shows the "both" empty-content alert when subject and body are blank', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: '  ', body: ' ' })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.emptyContentAlert).toBe('both')
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('shows the "subject" empty-content alert when only the subject is blank', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: '', body: 'Hi' })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.emptyContentAlert).toBe('subject')
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('shows the "body" empty-content alert when only the body is blank', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: 'Hi', body: '' })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.emptyContentAlert).toBe('body')
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('sends directly and closes the draft when recipients, subject and body are all present', async () => {
    const { result } = renderHook(() => useComposeSend(baseFields))

    await act(async () => {
      await result.current.handleSend()
    })

    expect(mockSendMail).toHaveBeenCalledWith({
      accountId: 'acc-1',
      mailKey: null,
      mail: { mocked: 'payload' },
    })
    expect(mockDispatch).toHaveBeenCalledWith(closeDraft({ draftId: 'draft-1' }))
  })

  it('does nothing when there is no selected identity', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, selectedIdentity: null })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(mockSendMail).not.toHaveBeenCalled()
    expect(result.current.showNoRecipientAlert).toBe(false)
    expect(result.current.emptyContentAlert).toBeNull()
  })

  it('does not close the draft when sendMail returns an error', async () => {
    mockSendMail.mockResolvedValue({ error: { status: 500 } })
    const { result } = renderHook(() => useComposeSend(baseFields))

    await act(async () => {
      await result.current.handleSend()
    })

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('handleConfirmSendAnyway clears the empty-content alert and sends', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: '', body: '' })
    )

    await act(async () => {
      await result.current.handleSend()
    })
    expect(result.current.emptyContentAlert).toBe('both')

    await act(async () => {
      await result.current.handleConfirmSendAnyway()
    })

    expect(result.current.emptyContentAlert).toBeNull()
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(closeDraft({ draftId: 'draft-1' }))
  })

  it('exposes isSending from the underlying mutation state', () => {
    mockUseSendMailMutation.mockReturnValue([mockSendMail, { isLoading: true }])
    const { result } = renderHook(() => useComposeSend(baseFields))

    expect(result.current.isSending).toBe(true)
  })

  describe('Undo Send', () => {
    it('keeps the draft open and shows an undo toast when the send is pending', async () => {
      const { toast } = require('sonner')
      const future = Math.round(Date.now() / 1000) + 30
      mockSendMail.mockResolvedValue({
        data: {
          data: {
            status: 'pending',
            pending_key: 'pending-1',
            undo_available_until: future,
          },
        },
      })
      const { result } = renderHook(() => useComposeSend(baseFields))

      await act(async () => {
        await result.current.handleSend()
      })

      // Draft stays open — no closeDraft dispatched.
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith(
        'mail_send.undo.message.string',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'mail_send.undo.action.string',
          }),
        })
      )
    })

    it('cancels the pending send when the undo action is clicked', async () => {
      const { toast } = require('sonner')
      const future = Math.round(Date.now() / 1000) + 30
      mockSendMail.mockResolvedValue({
        data: {
          data: {
            status: 'pending',
            pending_key: 'pending-1',
            undo_available_until: future,
          },
        },
      })
      const { result } = renderHook(() => useComposeSend(baseFields))

      await act(async () => {
        await result.current.handleSend()
      })

      const options = toast.success.mock.calls[0][1]
      await act(async () => {
        options.action.onClick()
      })

      expect(mockCancelPendingSend).toHaveBeenCalledWith({
        accountId: 'acc-1',
        pendingKey: 'pending-1',
      })
      // Still no draft close.
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('closes the draft normally for an immediate (non-pending) send', async () => {
      mockSendMail.mockResolvedValue({ data: { data: { status: 'sent' } } })
      const { result } = renderHook(() => useComposeSend(baseFields))

      await act(async () => {
        await result.current.handleSend()
      })

      expect(mockDispatch).toHaveBeenCalledWith(closeDraft({ draftId: 'draft-1' }))
    })
  })
})
