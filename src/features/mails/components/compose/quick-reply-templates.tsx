'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { Bookmark, FileText, Plus, Save, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

export interface QuickTemplate {
  id: string
  name: string
  subject: string
  body: string
}

const STORAGE_KEY = 'sogo_quick_templates'

function loadTemplates(): QuickTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTemplates(templates: QuickTemplate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  } catch {
    // ignore
  }
}

interface QuickReplyTemplatesProps {
  /** Current compose subject (pre-filled when saving) */
  currentSubject?: string
  /** Current compose body (pre-filled when saving) */
  currentBody?: string
  /** Called when a template is selected to insert into compose */
  onInsert: (subject: string, body: string) => void
}

export default function QuickReplyTemplates({
  currentSubject,
  currentBody,
  onInsert,
}: QuickReplyTemplatesProps) {
  const t = useTranslations('COMPOSE')
  const [open, setOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [templates, setTemplates] = useState<QuickTemplate[]>(loadTemplates)
  const [name, setName] = useState('')
  const [editSubject, setEditSubject] = useState(currentSubject || '')
  const [editBody, setEditBody] = useState(currentBody || '')

  const refresh = () => setTemplates(loadTemplates())

  const handleSave = () => {
    if (!name.trim()) return
    const newTemplate: QuickTemplate = {
      id: Date.now().toString(36),
      name: name.trim(),
      subject: editSubject,
      body: editBody,
    }
    const all = [...templates, newTemplate]
    saveTemplates(all)
    setTemplates(all)
    setName('')
    setSaveOpen(false)
  }

  const handleDelete = (id: string) => {
    const all = templates.filter((t) => t.id !== id)
    saveTemplates(all)
    setTemplates(all)
  }

  const handleInsert = (tmpl: QuickTemplate) => {
    onInsert(tmpl.subject, tmpl.body)
    setOpen(false)
  }

  return (
    <>
      {/* Insert template button */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title={t('templates.insert')}>
            <Bookmark className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {templates.length === 0 && (
            <DropdownMenuItem disabled>
              {t('templates.noTemplates')}
            </DropdownMenuItem>
          )}
          {templates.map((tmpl) => (
            <DropdownMenuItem
              key={tmpl.id}
              onSelect={() => handleInsert(tmpl)}
              className="flex items-center justify-between"
            >
              <span className="truncate">{tmpl.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(tmpl.id)
                }}
                className="text-muted-foreground hover:text-destructive ml-2 shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSaveOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            {t('templates.saveCurrent')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save as template dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('templates.saveTitle')}</DialogTitle>
            <DialogDescription>
              {t('templates.saveDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>{t('templates.templateName')}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('templates.namePlaceholder')}
              />
            </div>
            <div>
              <Label>{t('subject.string')}</Label>
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
            </div>
            <div>
              <Label>{t('body.string')}</Label>
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              {t('cancel.string')}
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {t('templates.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
