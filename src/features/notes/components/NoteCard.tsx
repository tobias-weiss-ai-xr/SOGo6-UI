'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { memo } from 'react'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
}

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const preview = note.content.length > 100
    ? `${note.content.slice(0, 100)}...`
    : note.content

  const formattedDate = formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true,
  })

  return (
    <Card className="p-4 shadow-sm transition-shadow hover:shadow-md" data-testid={`note-card-${note.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground mb-1">{note.title}</h4>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{preview}</p>
          <small className="text-xs text-muted-foreground">{formattedDate}</small>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(note)}
            aria-label="Edit note"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note.id)}
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default memo(NoteCard)
