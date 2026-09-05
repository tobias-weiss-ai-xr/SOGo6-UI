import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import AuthCallbackPage from '../page'

const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockDispatch = jest.fn()
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/features/auth/components/store/auth.slice', () => ({
  setCredentials: (payload: unknown) => ({
    type: 'auth/setCredentials',
    payload,
  }),
}))

let mockToken: string | null = null
jest.mock('@/lib/auth-callback', () => ({
  getTokenFromHash: () => mockToken,
}))

const makeJwt = (claims: Record<string, unknown>) => {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(claims)}.fake-signature`
}

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    localStorage.clear()
    mockToken = null
  })

  it('dispatches setCredentials with token + user before redirecting to INBOX', async () => {
    mockToken = makeJwt({
      uid: 'vader@example.org',
      cn: 'Darth Vader',
      email: 'vader@example.org',
    })
    render(<AuthCallbackPage />)
    await new Promise((r) => setTimeout(r, 50))

    expect(mockDispatch).toHaveBeenCalled()
    const call = mockDispatch.mock.calls.find(
      (c: any[]) => c[0]?.type === 'auth/setCredentials'
    )
    expect(call).toBeDefined()
    expect(call![0].payload).toEqual(
      expect.objectContaining({
        token: expect.stringContaining('.'),
        rememberMe: true,
        user: expect.objectContaining({ uid: 'vader@example.org' }),
      })
    )
    expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
  })

  it('redirects to login when no token in hash (no setCredentials)', async () => {
    mockToken = null
    render(<AuthCallbackPage />)
    await new Promise((r) => setTimeout(r, 50))

    expect(mockPush).toHaveBeenCalledWith('/auth/login')
    expect(
      mockDispatch.mock.calls.some(
        (c: any[]) => c[0]?.type === 'auth/setCredentials'
      )
    ).toBe(false)
  })
})
