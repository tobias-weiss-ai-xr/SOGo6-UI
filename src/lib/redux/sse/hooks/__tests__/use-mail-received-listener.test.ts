import '@testing-library/jest-dom'
import { render, waitFor, act } from '@testing-library/react'
import React from 'react'
import { useMailReceivedListener } from '@/lib/redux/sse/hooks/use-mail-received-listener'

// --- Mock the store plumbing ---
// The hook keeps a *module-level singleton registry* (Bug #45 fix) and its
// updateMailsCache dispatches a redux-thunk written for redux-thunk's POSITIONAL
// invocation contract: (dispatch, getState) — NOT a thunkApi object. Our
// dispatch double mimics redux-thunk so the cache-walk really executes
// (Bug #48-B: previously `thunkApi.getState` crashed as `e.getState is not a
// function` and the cache never updated).
//
// The singleton MUST be torn down when the last mount unmounts so a fresh
// mount subscribes again. Every test therefore wraps `unmount()` in `act()`
// (RTL's global auto-cleanup does not reliably flush passive-effect cleanups
// in this React 19 + jsdom setup, leaving the registry dirty across tests).

const mockDispatch = jest.fn((action: any) => {
  if (typeof action === 'function') {
    action(mockDispatchThunk, mockGetState) // redux-thunk positional contract
    return undefined
  }
  return action
})
let mockGetState: () => { api: { queries: Record<string, any> } }
let mockDispatchThunk: (action: any) => void

const mockSubscribe = jest.fn()
const mockUnsubscribe = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/features/mails/store/mails-api', () => ({}))

jest.mock('@/lib/redux/api/api-slice', () => {
  const updateQueryData = jest.fn(() => ({ type: 'test/updateQueryData' }))
  return {
    apiSlice: {
      reducerPath: 'api',
      util: { updateQueryData },
    },
  }
})

jest.mock('@/lib/redux/sse/sse-api', () => ({
  getSSEServiceInstance: jest.fn(),
}))

const { getSSEServiceInstance } = jest.requireMock(
  '@/lib/redux/sse/sse-api'
) as { getSSEServiceInstance: jest.Mock }

/** The api-slice mock's updateQueryData (fresh per module init). */
const mockUpdateQueryData = jest.fn()
;(jest.requireMock('@/lib/redux/api/api-slice') as {
  apiSlice: { util: { updateQueryData: jest.Mock } }
}).apiSlice.util.updateQueryData = mockUpdateQueryData

function TestHost({
  folder,
  accountId,
}: {
  folder?: string
  accountId?: string
}) {
  useMailReceivedListener(folder ?? 'INBOX', undefined, undefined, accountId ?? '0')
  return React.createElement('div', { 'data-testid': 'host' })
}

/** A cache entry with the shape RTK Query keeps for a fulfilled query. */
function folderEntry(folder: string, accountId: string) {
  return {
    endpointName: 'getFolderMessages',
    originalArgs: { folder, accountId },
    status: 'fulfilled',
  }
}

/** Capture the subscribe callback so tests can drive SSE events. */
function captureHandler(): (msg: unknown) => void {
  let handler: ((msg: unknown) => void) | undefined
  mockSubscribe.mockImplementation((event: string, cb: (m: unknown) => void) => {
    if (event === 'mail:received') handler = cb
    return mockUnsubscribe
  })
  return (msg: unknown) => {
    act(() => handler?.(msg))
  }
}

/** Rule: every test must unmount what it mounts (wrapped in act). */
async function unmount(root: { unmount: () => void }) {
  await act(async () => root.unmount())
}

describe('useMailReceivedListener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubscribe.mockReturnValue(mockUnsubscribe)
    ;(getSSEServiceInstance as unknown as jest.Mock).mockReturnValue({
      subscribe: mockSubscribe,
    })
    mockGetState = () => ({ api: { queries: {} } })
    mockDispatchThunk = jest.fn()
  })

  // ── Singleton registry (Bug #45): N mounts -> exactly ONE subscription ──
  describe('singleton registry', () => {
    it('subscribes exactly once for multiple mounts (one SSE channel)', async () => {
      const root = render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(TestHost, { folder: 'INBOX' }),
          React.createElement(TestHost, { folder: 'Drafts' }),
          React.createElement(TestHost, { folder: 'Sent' }),
        ),
      )
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalledTimes(1)
      })
      expect(mockSubscribe).toHaveBeenCalledWith('mail:received', expect.any(Function))
      await unmount(root)
    })

    it('unsubscribes only when the LAST registration is removed', async () => {
      const a = render(React.createElement(TestHost, { folder: 'INBOX' }))
      const b = render(React.createElement(TestHost, { folder: 'Drafts' }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalledTimes(1))

      await unmount(a)
      expect(mockUnsubscribe).not.toHaveBeenCalled() // another registration lives

      await unmount(b)
      await waitFor(() => expect(mockUnsubscribe).toHaveBeenCalledTimes(1))
    })

    it('resubscribes after full unmount (registry can reset)', async () => {
      const root = render(React.createElement(TestHost, { folder: 'INBOX' }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalledTimes(1))
      await unmount(root)
      await waitFor(() => expect(mockUnsubscribe).toHaveBeenCalledTimes(1))

      // Fresh mount must create a brand-new subscription.
      const root2 = render(React.createElement(TestHost, { folder: 'INBOX' }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalledTimes(2))
      await unmount(root2)
    })
  })

  // ── Event dispatch + cache walk (Bug #48-B) ────────────────────────────
  describe('mail:received cache update', () => {
    it('walks only the matching getFolderMessages cache entry', async () => {
      mockGetState = () => ({
        api: {
          queries: {
            k_inbox: folderEntry('INBOX', '0'),
            k_drafts: folderEntry('Drafts', '0'),
            k_other_account: folderEntry('INBOX', '7'),
            k_other_ep: { endpointName: 'getFolderDetail', originalArgs: { id: 'x' } },
          },
        },
      })
      const emit = captureHandler()
      const root = render(React.createElement(TestHost, { folder: 'INBOX', accountId: '0' }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalled())

      emit({ type: 'mail:received', data: { id: '99', subject: 'Hi', preview: 'P' } })
      await waitFor(() => {
        // Only the matching folder+accountId entry gets an updateQueryData call.
        expect(mockUpdateQueryData).toHaveBeenCalledWith(
          'getFolderMessages',
          expect.objectContaining({ folder: 'INBOX', accountId: '0' }),
          expect.any(Function),
        )
      })
      expect(mockUpdateQueryData).toHaveBeenCalledTimes(1)
      await unmount(root)
    })

    it('dedupes by mail id (no double-render under a notification storm)', async () => {
      const recipes: Array<(draft: any) => void> = []
      mockUpdateQueryData.mockImplementation(
        (_ep: string, _args: unknown, recipe: (d: any) => void) => {
          recipes.push(recipe)
          return { type: 'test/updateQueryData' }
        },
      )
      mockGetState = () => ({
        api: { queries: { k_inbox: folderEntry('INBOX', '0') } },
      })

      const emit = captureHandler()
      const root = render(React.createElement(TestHost, { folder: 'INBOX' }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalled())

      const mail = { id: '99', subject: 'Storm', preview: 'p', from: { name: 'S', email: 's@e' } }
      // Storm of N events for the SAME mail id.
      for (let i = 0; i < 5; i++) {
        emit({ type: 'mail:received', data: mail })
      }

      await waitFor(() => expect(mockUpdateQueryData).toHaveBeenCalled())
      expect(mockUpdateQueryData).toHaveBeenCalledTimes(5) // 5 events walked the cache

      // Simulate a draft cache that already contains the mail: applying the
      // recipe repeatedly must keep exactly one entry with id 99.
      const draft = { mails: [{ id: '10', subject: 'old' }], total: 1 }
      for (const recipe of recipes) recipe(draft)
      expect(draft.mails.filter((m: any) => String(m.id) === '99').length).toBe(1)
      expect(draft.total).toBe(2) // unshifted once, total bumped once
      await unmount(root)
    })

    it('handles a mismatched query-state shape without throwing', async () => {
      // getState can be undefined-state early — the walk must no-op safely.
      mockGetState = () => ({
        api: { queries: undefined as unknown as Record<string, never> },
      })
      const emit = captureHandler()
      const root = render(React.createElement(TestHost, { folder: 'INBOX' }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalled())

      emit({ type: 'mail:received', data: { id: '1', subject: 'x' } })
      await waitFor(() => expect(mockUpdateQueryData).not.toHaveBeenCalled())
      await unmount(root)
    })
  })

  // ── Basic rendering + lifecycle ────────────────────────────────────────
  describe('basic rendering', () => {
    it('renders host without throwing', () => {
      const { getByTestId } = render(React.createElement(TestHost))
      expect(getByTestId('host')).toBeInTheDocument()
    })

    it('subscribes to mail:received when SSE service is ready', async () => {
      const root = render(React.createElement(TestHost, { folder: 'Sent' }))
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalledWith('mail:received', expect.any(Function))
      })
      await unmount(root)
    })

    it('invokes handler and dispatches when a mail:received event is emitted', async () => {
      const emit = captureHandler()
      const root = render(React.createElement(TestHost, { folder: 'INBOX' }))
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled()
      })
      emit({ type: 'mail:received', data: { id: '99', subject: 'Hello', preview: 'Hi' } })
      await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
      await unmount(root)
    })

    it('unsubscribes on unmount', async () => {
      const root = render(React.createElement(TestHost))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalled())
      await unmount(root)
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})
