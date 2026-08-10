'use client'

import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import React from 'react'
import MailViewToggle from '../list/mail-view-toggle'

// Mock next-intl (useTranslations with no namespace → full key)
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock toggle-group so items render as real buttons we can click
jest.mock('@/components/ui/toggle-group', () => {
  const React = require('react')
  const ToggleGroupContext = React.createContext({ value: null, onValueChange: null })
  return {
    ToggleGroup: ({ children, value, onValueChange, ...props }: any) => (
      <ToggleGroupContext.Provider value={{ value, onValueChange }}>
        <div data-testid="toggle-group" data-value={value} {...props}>
          {children}
        </div>
      </ToggleGroupContext.Provider>
    ),
    ToggleGroupItem: ({ children, value, ...props }: any) => {
      const ctx = React.useContext(ToggleGroupContext)
      return (
        <button
          type="button"
          onClick={() => ctx.onValueChange?.(value)}
          {...props}
        >
          {children}
        </button>
      )
    },
  }
})

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
}))

describe('MailViewToggle', () => {
  const onChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders two toggle buttons (flat + conversation)', () => {
      render(<MailViewToggle value="flat" onChange={onChange} />)
      expect(
        screen.getByRole('button', { name: 'mails.viewFlat' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'mails.viewConversation' })
      ).toBeInTheDocument()
    })

    it('passes the current value to the toggle group', () => {
      render(<MailViewToggle value="conversation" onChange={onChange} />)
      expect(screen.getByTestId('toggle-group')).toHaveAttribute(
        'data-value',
        'conversation'
      )
    })
  })

  describe('interaction', () => {
    it('calls onChange with flat when the flat button is clicked', async () => {
      const user = userEvent.setup()
      render(<MailViewToggle value="conversation" onChange={onChange} />)
      await user.click(
        screen.getByRole('button', { name: 'mails.viewFlat' })
      )
      expect(onChange).toHaveBeenCalledWith('flat')
    })

    it('calls onChange with conversation when the conversation button is clicked', async () => {
      const user = userEvent.setup()
      render(<MailViewToggle value="flat" onChange={onChange} />)
      await user.click(
        screen.getByRole('button', { name: 'mails.viewConversation' })
      )
      expect(onChange).toHaveBeenCalledWith('conversation')
    })

    it('does not call onChange for an unknown value', async () => {
      const user = userEvent.setup()
      render(<MailViewToggle value="flat" onChange={onChange} />)
      await user.click(
        screen.getByRole('button', { name: 'mails.viewFlat' })
      )
      expect(onChange).toHaveBeenCalledWith('flat')
    })
  })
})
