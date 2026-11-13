'use client'

/**
 * Assistant action executor.
 *
 * Renders a structured `action` object proposed by the UI AI panel
 * (send draft / create event / create contact) for user review.
 * Execution only happens on explicit click — never auto-executed —
 * via the agent action facade using the browser session.
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  agentApi,
  type AgentEnvelope,
  type AssistantAction,
} from '@/lib/api/endpoints/agent'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  PlayCircle,
  XCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ReactNode, useCallback, useState } from 'react'
import { toast } from 'sonner'

type ExecutionState =
  | { phase: 'idle' }
  | { phase: 'running' }
  | { phase: 'done'; envelope: AgentEnvelope }
  | { phase: 'failed'; message: string }

const ACTION_LABEL_KEYS: Record<AssistantAction['id'], string> = {
  'mail.send': 'action.mailSend',
  'mail.drafts.create': 'action.mailDraftCreate',
  'mail.drafts.send': 'action.mailDraftSend',
  'mail.messages.get': 'action.mailMessageGet',
  'calendar.events.create': 'action.eventCreate',
  'calendar.events.update': 'action.eventUpdate',
  'calendar.events.delete': 'action.eventDelete',
  'contacts.create': 'action.contactCreate',
}

export function ActionExecutor({
  action,
  onExecuted,
}: {
  action: AssistantAction
  onExecuted?: (envelope: AgentEnvelope) => void
}): ReactNode {
  const t = useTranslations('AI_ASSISTANT')
  const [state, setState] = useState<ExecutionState>({ phase: 'idle' })
  const [showParams, setShowParams] = useState(false)

  const execute = useCallback(async () => {
    setState({ phase: 'running' })
    try {
      const envelope = await agentApi.execute(action)
      setState({ phase: 'done', envelope })
      onExecuted?.(envelope)
      if (envelope.error_code === 'S000000') {
        toast.success(t('executor.result.success'))
      } else {
        toast.error(`${t('executor.result.error')}: ${envelope.error_code}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setState({ phase: 'failed', message })
      toast.error(`${t('executor.result.error')}: ${message}`)
    }
  }, [action, onExecuted, t])

  const labelKey = ACTION_LABEL_KEYS[action.id]
  const busy = state.phase === 'running'
  // Only a true success disables the button — a facade error (e.g. missing
  // scope S000513) must stay retryable after the user fixes the permission.
  const done = state.phase === 'done' && state.envelope.error_code === 'S000000'

  return (
    <Card data-testid="assistant-action" className="border-dashed">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <PlayCircle className="text-primary h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {labelKey ? t(labelKey) : action.id}
                </span>
                <Badge variant="outline" className="text-xs">
                  {action.id}
                </Badge>
              </div>
              <p
                className="text-muted-foreground mt-1 text-sm"
                data-testid="assistant-action-summary"
              >
                {action.summary ?? t('executor.reviewHint')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={execute}
            disabled={busy || done}
            data-testid="assistant-action-execute"
          >
            {busy ? (
              <Loader2
                className="mr-1 h-4 w-4 animate-spin"
                data-testid="assistant-action-executing"
              />
            ) : (
              <Check className="mr-1 h-4 w-4" />
            )}
            {t('executor.execute')}
          </Button>
        </div>

        <div>
          <button
            type="button"
            className="text-muted-foreground flex items-center gap-1 text-xs"
            onClick={() => setShowParams((v) => !v)}
            data-testid="assistant-action-toggle-params"
          >
            {showParams ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {t('executor.showParams')}
          </button>
          {showParams && (
            <pre
              data-testid="assistant-action-params"
              className="bg-muted mt-2 overflow-x-auto rounded p-2 text-xs"
            >
              {JSON.stringify(action.params, null, 2)}
            </pre>
          )}
        </div>

        {state.phase === 'done' && (
          <div
            className={`flex items-start gap-2 text-sm ${state.envelope.error_code === 'S000000' ? 'text-green-600' : 'text-destructive'}`}
          >
            {state.envelope.error_code === 'S000000' ? (
              <Check className="mt-0.5 h-4 w-4" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4" />
            )}
            <span data-testid="assistant-action-result">
              {state.envelope.error_code === 'S000000'
                ? t('executor.result.success')
                : `${state.envelope.error_code}: ${state.envelope.error_msg}`}
            </span>
          </div>
        )}
        {state.phase === 'failed' && (
          <div className="text-destructive flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4" />
            <span data-testid="assistant-action-result">{state.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
