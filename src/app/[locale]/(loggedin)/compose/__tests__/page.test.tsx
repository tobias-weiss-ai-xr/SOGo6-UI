import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import ComposePage from '../page'

jest.mock('@/features/mails/components/compose/floating-compose', () => ({
  FloatingCompose: jest.fn(() => <div data-testid="floating-compose" />),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}))

const FloatingComposeMock = jest.requireMock(
  '@/features/mails/components/compose/floating-compose'
).FloatingCompose

const mount = () =>
  render(
    <Provider store={configureStore({ reducer: (state = {}) => state })}>
      <ComposePage />
    </Provider>
  )

describe('Compose Page (classic full-page)', () => {
  beforeEach(() => {
    FloatingComposeMock.mockClear()
  })

  it('renders the full-page compose (FloatingCompose in fullPage mode)', () => {
    mount()
    expect(screen.getByTestId('floating-compose')).toBeInTheDocument()
    expect(FloatingComposeMock).toHaveBeenCalledTimes(1)
    const props = FloatingComposeMock.mock.calls[0][0]
    expect(props.fullPage).toBe(true)
    expect(props.draftId).toEqual(expect.any(String))
  })
})
