// @ts-nocheck
import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import { DEFAULT_TEAM_INVITES } from '@/app/fakeApi/utils/team-calendar-seed'
import { NextRequest, NextResponse } from 'next/server'

const INVITES_COOKIE = 'demo_team_invites'

/**
 * POST /fakeApi/calendars/teams/invites/[inviteId]/reject
 * Rejects an invitation (status → rejected).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await params
  const invites = getDemoData(req, INVITES_COOKIE, DEFAULT_TEAM_INVITES) as Array<
    Record<string, unknown>
  >
  const index = invites.findIndex((i) => i.id === inviteId)
  if (index === -1) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }
  const next = [...invites]
  next[index] = { ...next[index], status: 'rejected' }
  const response = NextResponse.json(next[index])
  setDemoData(response, INVITES_COOKIE, next, req)
  return response
}
