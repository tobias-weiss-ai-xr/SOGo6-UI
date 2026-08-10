// @ts-nocheck
import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import { DEFAULT_TEAM_CALENDARS } from '@/app/fakeApi/utils/team-calendar-seed'
import { NextRequest, NextResponse } from 'next/server'

const TEAMS_COOKIE = 'demo_team_calendars'

/**
 * GET /fakeApi/calendars/teams/[teamId]
 * Returns a single team calendar.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const teams = getDemoData(
    _req,
    TEAMS_COOKIE,
    DEFAULT_TEAM_CALENDARS
  ) as Array<{ id: string }>
  const team = teams.find((t) => t.id === teamId)
  if (!team) {
    return NextResponse.json({ error: 'Team calendar not found' }, { status: 404 })
  }
  return NextResponse.json(team)
}

/**
 * PATCH /fakeApi/calendars/teams/[teamId]
 * Updates a team calendar's name/description/color.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const teams = getDemoData(
    req,
    TEAMS_COOKIE,
    DEFAULT_TEAM_CALENDARS
  ) as Array<Record<string, unknown>>
  const index = teams.findIndex((t) => t.id === teamId)
  if (index === -1) {
    return NextResponse.json({ error: 'Team calendar not found' }, { status: 404 })
  }

  const body = await req.json()
  const current = teams[index]
  const updated = {
    ...current,
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.color !== undefined ? { color: body.color } : {}),
    updated_at: new Date().toISOString(),
  }

  const next = [...teams]
  next[index] = updated
  const response = NextResponse.json(updated)
  setDemoData(response, TEAMS_COOKIE, next, req)
  return response
}

/**
 * DELETE /fakeApi/calendars/teams/[teamId]
 * Deletes a team calendar.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const teams = getDemoData(
    req,
    TEAMS_COOKIE,
    DEFAULT_TEAM_CALENDARS
  ) as Array<{ id: string }>
  const next = teams.filter((t) => t.id !== teamId)
  if (next.length === teams.length) {
    return NextResponse.json({ error: 'Team calendar not found' }, { status: 404 })
  }
  const response = NextResponse.json({ success: true })
  setDemoData(response, TEAMS_COOKIE, next, req)
  return response
}
