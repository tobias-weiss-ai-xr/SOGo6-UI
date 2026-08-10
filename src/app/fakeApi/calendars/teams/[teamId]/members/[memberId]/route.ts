// @ts-nocheck
import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import { DEFAULT_TEAM_MEMBERS } from '@/app/fakeApi/utils/team-calendar-seed'
import { NextRequest, NextResponse } from 'next/server'

const MEMBERS_COOKIE = 'demo_team_members'

/**
 * PATCH /fakeApi/calendars/teams/[teamId]/members/[memberId]
 * Updates a member's share_level (owner/editor/viewer).
 */
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ teamId: string; memberId: string }>
  }
) {
  const { teamId, memberId } = await params
  const allMembers = getDemoData(
    req,
    MEMBERS_COOKIE,
    DEFAULT_TEAM_MEMBERS
  ) as Record<string, Array<Record<string, unknown>>>
  const members = allMembers[teamId] ?? []
  const index = members.findIndex((m) => m.id === memberId)
  if (index === -1) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const body = await req.json()
  if (
    body.share_level !== undefined &&
    !['owner', 'editor', 'viewer'].includes(body.share_level)
  ) {
    return NextResponse.json(
      { error: 'Invalid share_level' },
      { status: 400 }
    )
  }

  const next = [...members]
  next[index] = { ...next[index], ...body }
  const response = NextResponse.json(next[index])
  setDemoData(response, MEMBERS_COOKIE, { ...allMembers, [teamId]: next }, req)
  return response
}

/**
 * DELETE /fakeApi/calendars/teams/[teamId]/members/[memberId]
 * Removes a member from a team calendar.
 */
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ teamId: string; memberId: string }>
  }
) {
  const { teamId, memberId } = await params
  const allMembers = getDemoData(
    req,
    MEMBERS_COOKIE,
    DEFAULT_TEAM_MEMBERS
  ) as Record<string, Array<{ id: string }>>
  const members = allMembers[teamId] ?? []
  const next = members.filter((m) => m.id !== memberId)
  if (next.length === members.length) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  const response = NextResponse.json({ success: true })
  setDemoData(response, MEMBERS_COOKIE, { ...allMembers, [teamId]: next }, req)
  return response
}