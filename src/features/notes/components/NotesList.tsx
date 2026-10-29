'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { memo, useCallback, useEffect, useState } from 'react'
import fetchClient from '../fetch-client'
import NoteCard from './NoteCard'
import NotesEditor from './NotesEditor'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
}

function NotesList() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchClient('/api/v1/user/notes')
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }
      const data = await response.json()
      setNotes(data.notes)
    } catch (err) {
      setError('Failed to load notes. Please try again.')
      console.error('Failed to fetch notes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleEdit = useCallback((note: Note) => {
    setEditingNote(note)
    setIsEditorOpen(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetchClient(`/api/v1/user/notes/${id}`, { method: 'DELETE' })
      await fetchNotes()
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }, [fetchNotes])

  const handleSave = useCallback(async (note: Partial<Note>) => {
    try {
      if (editingNote) {
        // Update existing note
        const updatedNote = {
          title: note.title,
          content: note.content,
        }
        await fetchClient(`/api/v1/user/notes/${editingNote.id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedNote),
        })
      } else {
        // Create new note
        const newNote = {
          title: note.title,
          content: note.content,
        }
        await fetchClient('/api/v1/user/notes', {
          method: 'POST',
          body: JSON.stringify(newNote),
        })
      }
      await fetchNotes()
      setIsEditorOpen(false)
      setEditingNote(null)
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }, [editingNote, fetchNotes])

  const handleCreate = useCallback(() => {
    setEditingNote(null)
    setIsEditorOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsEditorOpen(false)
    setEditingNote(null)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>Create Note</Button>
      </div>

      {notes && notes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-8">
          <p className="mb-4">No notes found</p>
          <Button onClick={handleCreate}>Create your first note</Button>
        </div>
      )}

      <NotesEditor
        open={isEditorOpen}
        onClose={handleClose}
        onSave={handleSave}
        note={editingNote}
      />
    </div>
  )
}

export default memo(NotesList)
