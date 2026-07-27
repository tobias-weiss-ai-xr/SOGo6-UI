'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronRight,
  Mail,
  MailOpen,
  Paperclip,
  Star,
  User,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import type { Conversation } from '../hooks/use-conversations'
import type { ImapMessagesList } from '../mails-types'
import { formatDate } from './list-item-utils'

interface ConversationItemProps {
  conversation: Conversation
  isSelected?: boolean
  onSelect?: (threadId: string) => void
  onMailSelect?: (mail: ImapMessagesList) => void
}

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onMailSelect,
}: ConversationItemProps) {
  const t = useTranslations()
  const [expanded, setExpanded] = useState(isSelected)

  const { id, subject, participants, mails, count, hasUnread, hasFlagged } =
    conversation

  const toggleExpand = () => {
    setExpanded(!expanded)
    if (!expanded) onSelect?.(id)
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0]?.toUpperCase() || '?'
  }

  return (
    <div
      className={cn(
        'border-b border-border transition-colors',
        isSelected ? 'bg-accent' : 'hover:bg-accent/50'
      )}
    >
      {/* Thread summary header */}
      <button
        onClick={toggleExpand}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {/* Expand/collapse chevron */}
        <span className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>

        {/* Participants avatars */}
        <div className="flex -space-x-2">
          {participants.slice(0, 3).map((email, i) => (
            <Avatar key={i} className="h-7 w-7 border-2 border-background">
              <AvatarFallback className="text-[10px]">
                {getInitials('', email)}
              </AvatarFallback>
            </Avatar>
          ))}
          {participants.length > 3 && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] text-muted-foreground">
              +{participants.length - 3}
            </span>
          )}
        </div>

        {/* Thread info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'truncate text-sm',
                hasUnread ? 'font-semibold' : 'font-normal'
              )}
            >
              {subject}
            </span>
            {count > 1 && (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {count}
              </Badge>
            )}
            {hasFlagged && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{participants.join(', ')}</span>
          </div>
        </div>

        {/* Date and indicators */}
        <div className="flex shrink-0 items-center gap-2">
          {!hasUnread && <MailOpen className="h-3.5 w-3.5 text-muted-foreground" />}
          {hasUnread && <Mail className="h-3.5 w-3.5 text-primary" />}
          <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
            {formatDate(conversation.lastDate)}
          </span>
        </div>
      </button>

      {/* Expanded mail list */}
      {expanded && (
        <div className="border-t border-border">
          {mails.map((mail) => (
            <button
              key={mail.id}
              onClick={() => onMailSelect?.(mail)}
              className="flex w-full items-center gap-3 px-4 py-2 pl-12 text-left hover:bg-accent/50"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[9px]">
                  {getInitials(mail.from?.name || '', mail.from?.email || '')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'truncate text-sm',
                      !mail.seen ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {mail.from?.name || mail.from?.email || 'Unknown'}
                  </span>
                  {mail.hasAttachment && (
                    <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {mail.snippet}
                </p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatDate(mail.date)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
