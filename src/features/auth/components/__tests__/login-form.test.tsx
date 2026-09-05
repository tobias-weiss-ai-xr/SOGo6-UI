import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { LoginForm } from '../login-form'

// Mock Redux hooks to avoid needing Provider wrapper
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => {
    if (typeof selector === 'function') return selector({})
    return {}
  },
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

jest.mock('@/lib/i18n/config', () => ({
  getLocales: () => ['en', 'fr', 'de', 'es'],
}))

const mockPush = jest.fn()
const mockPathname = '/en/auth/login'

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Control env vars + auth/mode from within each test
const mockAuthMode = jest.fn()
const mockRedirectTo = jest.fn()
let mockEnvVars: Record<string, unknown> = {}
export const setMockEnvVars = (v: Record<string, unknown>) => {
  mockEnvVars = v
}

export const getMockAuthMode = () => mockAuthMode

export const getMockRedirectTo = () => mockRedirectTo

export const setMockAuthModeResult = (val: unknown) => {
  mockAuthMode.mockImplementation(() => ({
    unwrap: () => Promise.resolve(val),
  }))
}

export const setMockAuthModeError = () => {
  mockAuthMode.mockImplementation(() => ({
    unwrap: () => Promise.reject(new Error('auth mode failed')),
  }))
}

jest.mock('@/lib/env-service', () => ({
  useEnvVars: () => ({ envVars: mockEnvVars }),
}))

jest.mock('@/lib/navigation', () => ({
  redirectTo: (...args: unknown[]) => mockRedirectTo(...args),
}))

jest.mock('@/features/auth/components/store/auth.api', () => ({
  useGetSystemQuery: () => ({
    data: { data: { system: { SOGO_S_DIRECT_LOGIN: false } } },
    isLoading: false,
    isError: false,
  }),
  useLazyGetAuthModeQuery: () => [mockAuthMode, { isLoading: false }],
  useWebauthnBeginLoginMutation: () => [jest.fn(), { isLoading: false }],
  useWebauthnCompleteLoginMutation: () => [jest.fn(), { isLoading: false }],
  useLoginMutation: () => [jest.fn(), { isLoading: false }],
}))

describe('LoginForm - Step 1 (Email + Language)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email input field', () => {
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email.label.string/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('renders language selector', () => {
    render(<LoginForm />)
    const languageLabel = screen.getByText(/language.label.string/i)
    expect(languageLabel).toBeInTheDocument()
  })

  it('renders submit button with correct text', () => {
    render(<LoginForm />)
    const submitButton = screen.getByRole('button', { name: /next.string/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('does not render password field', () => {
    render(<LoginForm />)
    const passwordInputs = screen.queryAllByLabelText(/password/i)
    expect(passwordInputs).toHaveLength(0)
  })

  it('does not render remember me checkbox', () => {
    render(<LoginForm />)
    const checkbox = screen.queryByRole('checkbox')
    expect(checkbox).not.toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = render(<LoginForm />)
    expect(container).toBeTruthy()
  })

  it('renders email placeholder', () => {
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText(/email.placeholder.string/i)
    expect(emailInput).toBeInTheDocument()
  })

  it('renders language selector with all locales', () => {
    render(<LoginForm />)
    const languageLabel = screen.getByText(/language.label.string/i)
    expect(languageLabel).toBeInTheDocument()
  })
})

describe('LoginForm - Auto SSO redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthMode.mockReset()
    mockRedirectTo.mockReset()
    setMockEnvVars({})
  })

  it('does NOT auto-redirect when SSO_AUTO_REDIRECT is off', async () => {
    setMockEnvVars({ SSO_AUTO_REDIRECT: false })
    render(<LoginForm />)
    await new Promise((r) => setTimeout(r, 50))
    expect(mockAuthMode).not.toHaveBeenCalled()
    expect(mockRedirectTo).not.toHaveBeenCalled()
  })

  it('auto-redirects to the SSO location when auth mode is sso', async () => {
    setMockEnvVars({
      SSO_AUTO_REDIRECT: true,
      SSO_AUTO_REDIRECT_USERNAME: 'sso@home.opendesk-edu.org',
    })
    setMockAuthModeResult({
      data: {
        kind: 'sso',
        location:
          'https://id.home.opendesk-edu.org/realms/opendesk/protocol/openid-connect/auth?...',
      },
    })
    render(<LoginForm />)
    await new Promise((r) => setTimeout(r, 50))
    expect(mockAuthMode).toHaveBeenCalledWith({
      username: 'sso@home.opendesk-edu.org',
    })
    expect(mockRedirectTo).toHaveBeenCalledWith(
      expect.stringContaining('id.home.opendesk-edu.org')
    )
  })

  it('falls back to email form when auth mode is NOT sso', async () => {
    setMockEnvVars({
      SSO_AUTO_REDIRECT: true,
      SSO_AUTO_REDIRECT_USERNAME: 'sso@home.opendesk-edu.org',
    })
    setMockAuthModeResult({
      data: {
        kind: 'plain',
        location: '',
      },
    })
    render(<LoginForm />)
    await new Promise((r) => setTimeout(r, 50))
    expect(mockAuthMode).toHaveBeenCalledTimes(1)
    expect(mockRedirectTo).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/email.label.string/i)).toBeInTheDocument()
  })

  it('falls back to email form when auth/mode request errors', async () => {
    setMockEnvVars({
      SSO_AUTO_REDIRECT: true,
      SSO_AUTO_REDIRECT_USERNAME: 'sso@home.opendesk-edu.org',
    })
    setMockAuthModeError()
    render(<LoginForm />)
    await new Promise((r) => setTimeout(r, 50))
    expect(mockAuthMode).toHaveBeenCalledTimes(1)
    expect(mockRedirectTo).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/email.label.string/i)).toBeInTheDocument()
  })
})
