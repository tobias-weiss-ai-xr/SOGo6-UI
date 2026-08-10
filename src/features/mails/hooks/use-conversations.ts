import { useMemo } from 'react'
import type { ImapMessagesList } from '../mails-types'

export interface Conversation {
  /** Stable thread identifier (root message-id) */
  id: string
  /** Mails in this conversation, sorted by date ascending */
  mails: ImapMessagesList[]
  /** Subject of the thread (from the most recent mail) */
  subject: string
  /** Unique participants (from/to addresses) */
  participants: string[]
  /** Date of the earliest mail */
  startDate: string
  /** Date of the latest mail */
  lastDate: string
  /** Total number of mails in the thread */
  count: number
  /** Whether any mail in the thread is unread */
  hasUnread: boolean
  /** Whether any mail in the thread is flagged */
  hasFlagged: boolean
}

/**
 * Groups a flat list of mails into conversations by threadId.
 * Mails without a threadId become their own single-message conversation.
 */
export function useConversations(mails: ImapMessagesList[]): Conversation[] {
  return useMemo(() => {
    const groups = new Map<string, ImapMessagesList[]>()

    for (const mail of mails) {
      const tid = mail.threadId || mail.messageId || mail.id
      if (!tid) continue
      const list = groups.get(tid)
      if (list) {
        list.push(mail)
      } else {
        groups.set(tid, [mail])
      }
    }

    const conversations: Conversation[] = []

    for (const [tid, threadMails] of groups) {
      // Sort by date ascending
      threadMails.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      const participants = new Set<string>()
      for (const m of threadMails) {
        if (m.from?.email) participants.add(m.from.email)
        for (const t of m.to || []) {
          if (t.email) participants.add(t.email)
        }
      }

      const lastMail = threadMails[threadMails.length - 1]
      const firstMail = threadMails[0]

      conversations.push({
        id: tid,
        mails: threadMails,
        subject: lastMail?.subject || '(No subject)',
        participants: Array.from(participants),
        startDate: firstMail?.date || '',
        lastDate: lastMail?.date || '',
        count: threadMails.length,
        hasUnread: threadMails.some((m) => !m.seen),
        hasFlagged: threadMails.some((m) => m.flagged),
      })
    }

    // Sort by lastDate descending (most recent conversation first)
    conversations.sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    )

    return conversations
  }, [mails])
}
