import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import NotesList from '../components/NotesList'

// Mock the fetch-client module used by NotesList
// Note: NotesList.tsx currently has a bug - it uses memo() without importing it from 'react'
// This test assumes that bug is fixed by adding: import { memo, useCallback, useEffect, useState } from 'react'

const mockFetchClient = jest.fn()

jest.mock('../fetch-client', () => ({
  __esModule: true,
  default: jest.fn(() => mockFetchClient()),
}))

// Mock NoteCard component
jest.mock('../components/NoteCard', () => ({
  __esModule: true,
  default: ({ note }: { note: { id: string } }) => (
    <div data-testid={`note-card-${note.id}`}>NoteCard Mock</div>
  ),
}))

// Mock NotesEditor component
jest.mock('../components/NotesEditor', () => ({
  __esModule: true,
  default: () => <div data-testid="notes-editor-mock" />,
}))

describe('NotesList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when data is loading', () => {
    mockFetchClient.mockImplementation(() =>
      // Return a pending promise to keep loading state
      new Promise(() => {})
    )

    render(<NotesList />)

    // Should show 3 Skeleton loading indicators
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('renders no notes message when data is empty array', async () => {
    mockFetchClient.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ notes: [] }),
    })

    render(<NotesList />)

    // Wait for the component to finish loading and display empty state
    await waitFor(() => {
      expect(screen.getByText(/No notes found/i)).toBeInTheDocument()
    })
  })

  it('renders NoteCard when data has a note', async () => {
    const mockNotes = [
      {
        id: '1',
        title: 'Test Note',
        content: 'Test content',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    mockFetchClient.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ notes: mockNotes }),
    })

    render(<NotesList />)

    // Wait for NoteCard to render
    await waitFor(() => {
      expect(screen.getByTestId('note-card-1')).toBeInTheDocument()
    })
  })
})
