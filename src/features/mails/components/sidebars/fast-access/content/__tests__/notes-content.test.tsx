import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import NotesContent from '../notes-content'

jest.mock('@/features/notes', () => ({
  __esModule: true,
  default: () => <div data-testid="notes-protected" />,
}))

describe('NotesContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders NotesProtected', () => {
      render(<NotesContent />)
      expect(screen.getByTestId('notes-protected')).toBeInTheDocument()
    })
  })

  describe('component stability', () => {
    it('renders consistently after rerender', () => {
      const { rerender } = render(<NotesContent />)
      rerender(<NotesContent />)
      expect(screen.getByTestId('notes-protected')).toBeInTheDocument()
    })
  })
})
