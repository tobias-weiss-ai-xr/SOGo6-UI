import type { ApiFilterItem } from '@/features/user-settings/mail/filters/mail-filters-api-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Fake API for Sieve Editor granular filter endpoints:
 *   GET    /api/v1/mailboxes/{accountId}/filters/{filterId}
 *   PUT    /api/v1/mailboxes/{accountId}/filters/{filterId}
 *   DELETE /api/v1/mailboxes/{accountId}/filters/{filterId}
 *
 * Mirrors the backend ApiMailFilterItemResource behaviour (filter name acts as id).
 */

const defaultFilters: ApiFilterItem[] = [
  {
    name: 'Filter 1',
    enabled: true,
    rules: {
      op: 'and',
      rules: [{ field: 'from', operator: 'contains', value: 'alinto.eu' }],
    },
    actions: [
      {
        method: 'fileinto',
        arguments: { folders: ['INBOX'], create_if_no_exist: true },
      },
    ],
  },
  {
    name: 'Copy to Archive',
    enabled: true,
    rules: {
      op: 'and',
      rules: [{ field: 'subject', operator: 'contains', value: '[COPY]' }],
    },
    actions: [
      {
        method: 'fileinto',
        arguments: { folders: ['Archive'], create_if_no_exist: true, keep_copy: true },
      },
    ],
  },
]

const store = new Map<string, ApiFilterItem[]>()

function getFilters(accountId: string): ApiFilterItem[] {
  if (!store.has(accountId)) {
    store.set(accountId, accountId === '0' ? structuredClone(defaultFilters) : [])
  }
  return store.get(accountId) ?? []
}

function findIndex(filters: ApiFilterItem[], name: string): number {
  return filters.findIndex((f) => f.name.toLowerCase() === name.toLowerCase())
}

function okResponse(data: unknown) {
  return NextResponse.json({ error_code: 'S000000', error_msg: 'No Error', data })
}

function notFoundResponse() {
  return NextResponse.json(
    { error_code: 'S000318', error_msg: 'Filter Not Found', data: null },
    { status: 404 }
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string; filterId: string }> }
) {
  const { accountId, filterId } = await params
  const filters = getFilters(accountId)
  const idx = findIndex(filters, filterId)
  if (idx < 0) return notFoundResponse()
  return okResponse({ filter: filters[idx] })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string; filterId: string }> }
) {
  const { accountId, filterId } = await params
  const body = (await req.json()) as ApiFilterItem
  const filters = getFilters(accountId)
  const idx = findIndex(filters, filterId)
  const updated = { ...body, name: filterId }
  if (idx >= 0) {
    filters[idx] = updated
  } else {
    filters.push(updated)
  }
  store.set(accountId, filters)
  return okResponse({ filters })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string; filterId: string }> }
) {
  const { accountId, filterId } = await params
  const filters = getFilters(accountId)
  const idx = findIndex(filters, filterId)
  if (idx < 0) return notFoundResponse()
  filters.splice(idx, 1)
  store.set(accountId, filters)
  return okResponse({ filters })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'PUT', 'DELETE'] }, { status: 200 })
}
