'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { memo, useCallback, useState } from 'react'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
}

interface NotesEditorProps {
  open: boolean
  onClose: () => void
  onSave: (note: Partial<Note>) => void
  note: Note | null
}

function NotesEditor({ open, onClose, onSave, note }: NotesEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Initialize form with note data when the editor opens or switches notes.
  // React docs: "adjusting state when a prop changes" — setState during render
  // is allowed and avoids the cascading renders of an effect (react-hooks/set-state-in-effect).
  const [prevNote, setPrevNote] = useState(note)
  const [prevOpen, setPrevOpen] = useState(open)
  if (note !== prevNote || (open && !prevOpen)) {
    setPrevNote(note)
    setPrevOpen(open)
    setTitle(note ? note.title : '')
    setContent(note ? note.content : '')
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSave({ title, content })
    },
    [content, onSave, title]
  )

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Create Note'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content"
              rows={10}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default memo(NotesEditor)
