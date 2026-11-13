/**
 * Agent Action API Endpoints
 * Thin executor for the agent action facade (/api/user/v1/agent/*).
 *
 * The UI AI panel attaches structured `action` objects to assistant output
 * (send draft / create event / create contact). Actions are user-reviewed
 * and executed one-click via this module using the browser session
 * (apiClient attaches the session voucher automatically). Never auto-executed.
 */

import type { BackendResponse } from '../backend-response'
import type { ApiResponse } from '../client/base-client'
import { apiClient } from '../client/base-client'

// ========== Types ==========

/** Manifest action ids the UI assistant may propose. */
export type AssistantActionId =
  | 'mail.send'
  | 'mail.drafts.create'
  | 'calendar.events.create'
  | 'contacts.create'

/**
 * Structured action object attached to assistant output.
 * `params` carries path, query and body values for the facade call.
 */
export interface AssistantAction {
  id: AssistantActionId
  params: Record<string, unknown>
  /** Human-readable review line shown before execution. */
  summary?: string
}

/** Facade response envelope (ApiBaseResponse). */
export interface AgentEnvelope<T = unknown> {
  error_code: string
  error_msg: string
  data: T | null
}

// ========== Action registry (mirrors the facade manifest) ==========

interface ActionRoute {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  /** `{param}` placeholders are substituted from `params`. */
  path: string
}

const ACTION_ROUTES: Record<AssistantActionId, ActionRoute> = {
  'mail.send': { method: 'POST', path: '/api/user/v1/agent/mail/send' },
  'mail.drafts.create': {
    method: 'POST',
    path: '/api/user/v1/agent/mail/drafts',
  },
  'calendar.events.create': {
    method: 'POST',
    path: '/api/user/v1/agent/calendar/events',
  },
  'contacts.create': { method: 'POST', path: '/api/user/v1/agent/contacts' },
}

export function buildRequest(action: AssistantAction): {
  method: ActionRoute['method']
  url: string
  body: Record<string, unknown>
} {
  const route = ACTION_ROUTES[action.id]
  let url = route.path
  const body: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(action.params)) {
    const placeholder = `{${key}}`
    if (url.includes(placeholder)) {
      url = url.replace(placeholder, encodeURIComponent(String(value)))
    } else {
      body[key] = value
    }
  }
  return { method: route.method, url, body }
}

// ========== API ==========

export class AgentApi {
  /**
   * Execute a user-approved assistant action against the agent facade.
   * Throws on transport errors; check `error_code` in the envelope for
   * facade-level errors (e.g. S000513 scope, S000514 impersonation target).
   */
  async execute<T = unknown>(
    action: AssistantAction
  ): Promise<AgentEnvelope<T>> {
    const { method, url, body } = buildRequest(action)
    let response: ApiResponse<AgentEnvelope<T>>
    switch (method) {
      case 'GET':
        response = await apiClient.get<AgentEnvelope<T>>(url, {
          params: body as Record<string, string>,
        })
        break
      case 'PATCH':
        response = await apiClient.patch<AgentEnvelope<T>>(url, body)
        break
      case 'DELETE':
        response = await apiClient.delete<AgentEnvelope<T>>(url, body)
        break
      case 'PUT':
        response = await apiClient.put<AgentEnvelope<T>>(url, body)
        break
      default:
        response = await apiClient.post<AgentEnvelope<T>>(url, body)
    }
    return response.data
  }

  /** Fetch the action manifest (for the AI panel's capability picker). */
  async getManifest(): Promise<{
    version: number
    actions: Array<{
      id: string
      description: string
      scope: string
      method: string
      path: string
    }>
  }> {
    const response = await apiClient.get<
      BackendResponse<{
        version: number
        actions: Array<{
          id: string
          description: string
          scope: string
          method: string
          path: string
        }>
      }>
    >('/api/user/v1/agent/manifest')
    return apiClient.unwrapBackendResponse(response)
  }
}

export const agentApi = new AgentApi()
