// @ts-nocheck
import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import { DEFAULT_TEAM_CALENDARS } from '@/app/fakeApi/utils/team-calendar-seed'
import { NextRequest, NextResponse } from 'next/server'

const TEAMS_COOKIE = 'demo_team_calendars'

/**
 * GET /fakeApi/calendars/teams
 * Returns all team calendars for the demo user.
 */
export async function GET(req: NextRequest) {
  try {
    const teams = getDemoData(req, TEAMS_COOKIE, DEFAULT_TEAM_CALENDARS)
    return NextResponse.json({ calendars: teams, total_count: teams.length })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list team calendars' },
      { status: 500 }
    )
  }
}

/**
 * POST /fakeApi/calendars/teams
 * Creates a new team calendar.
 * Body: { name, description?, color? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    const teams = getDemoData(req, TEAMS_COOKIE, DEFAULT_TEAM_CALENDARS)
    const now = new Date().toISOString()
    const newTeam = {
      id: `team-${Date.now()}`,
      name: body.name,
      description: body.description ?? '',
      color: body.color ?? '#4f46e5',
      owner_id: 'user-1',
      created_at: now,
      updated_at: now,
    }

    const updated = [...teams, newTeam]
    const response = NextResponse.json(newTeam, { status: 201 })
    setDemoData(response, TEAMS_COOKIE, updated, req)
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create team calendar' },
      { status: 500 }
    )
  }
}
