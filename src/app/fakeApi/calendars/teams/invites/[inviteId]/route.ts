// @ts-nocheck
import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import { DEFAULT_TEAM_INVITES } from '@/app/fakeApi/utils/team-calendar-seed'
import { NextRequest, NextResponse } from 'next/server'

const INVITES_COOKIE = 'demo_team_invites'

/**
 * GET /fakeApi/calendars/teams/invites/[inviteId]
 * Returns a single invitation.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await params
  const invites = getDemoData(req, INVITES_COOKIE, DEFAULT_TEAM_INVITES) as Array<{
    id: string
  }>
  const invite = invites.find((i) => i.id === inviteId)
  if (!invite) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }
  return NextResponse.json(invite)
}

/**
 * DELETE /fakeApi/calendars/teams/invites/[inviteId]
 * Cancels an invitation.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await params
  const invites = getDemoData(req, INVITES_COOKIE, DEFAULT_TEAM_INVITES) as Array<{
    id: string
  }>
  const next = invites.filter((i) => i.id !== inviteId)
  if (next.length === invites.length) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }
  const response = NextResponse.json({ success: true })
  setDemoData(response, INVITES_COOKIE, next, req)
  return response
}
