// @ts-nocheck
import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import {
  DEFAULT_TEAM_CALENDARS,
  DEFAULT_TEAM_MEMBERS,
} from '@/app/fakeApi/utils/team-calendar-seed'
import { NextRequest, NextResponse } from 'next/server'

const TEAMS_COOKIE = 'demo_team_calendars'
const MEMBERS_COOKIE = 'demo_team_members'

/**
 * GET /fakeApi/calendars/teams/[teamId]/members
 * Lists all members of a team calendar.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const teams = getDemoData(
    req,
    TEAMS_COOKIE,
    DEFAULT_TEAM_CALENDARS
  ) as Array<{ id: string }>
  if (!teams.some((t) => t.id === teamId)) {
    return NextResponse.json({ error: 'Team calendar not found' }, { status: 404 })
  }

  const members = getDemoData(
    req,
    MEMBERS_COOKIE,
    DEFAULT_TEAM_MEMBERS[teamId] ?? []
  ) as unknown[]
  return NextResponse.json({ members, total_count: members.length })
}

/**
 * POST /fakeApi/calendars/teams/[teamId]/members
 * Adds a member to a team calendar.
 * Body: { email, display_name?, share_level? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const teams = getDemoData(
    req,
    TEAMS_COOKIE,
    DEFAULT_TEAM_CALENDARS
  ) as Array<{ id: string }>
  const team = teams.find((t) => t.id === teamId)
  if (!team) {
    return NextResponse.json({ error: 'Team calendar not found' }, { status: 404 })
  }

  const body = await req.json()
  if (!body?.email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  const allMembers = getDemoData(
    req,
    MEMBERS_COOKIE,
    DEFAULT_TEAM_MEMBERS
  ) as Record<string, unknown[]>
  const existing = (allMembers[teamId] ?? []) as Array<{ email: string }>
  if (existing.some((m) => m.email === body.email)) {
    return NextResponse.json(
      { error: 'Member already exists' },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()
  const newMember = {
    id: `member-${Date.now()}`,
    team_id: teamId,
    display_name: body.display_name ?? body.email.split('@')[0],
    email: body.email,
    share_level: body.share_level ?? 'viewer',
    joined_at: now,
  }

  const nextMembers = { ...allMembers, [teamId]: [...existing, newMember] }
  const response = NextResponse.json(newMember, { status: 201 })
  setDemoData(response, MEMBERS_COOKIE, nextMembers, req)
  return response
}