// @ts-nocheck
import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import {
  DEFAULT_TEAM_CALENDARS,
  DEFAULT_TEAM_INVITES,
} from '@/app/fakeApi/utils/team-calendar-seed'
import { NextRequest, NextResponse } from 'next/server'

const TEAMS_COOKIE = 'demo_team_calendars'
const INVITES_COOKIE = 'demo_team_invites'

/**
 * GET /fakeApi/calendars/teams/invites
 * Lists all pending team calendar invitations for the demo user.
 */
export async function GET(req: NextRequest) {
  try {
    const invites = getDemoData(req, INVITES_COOKIE, DEFAULT_TEAM_INVITES)
    const pending = invites.filter((i) => i.status === 'pending')
    return NextResponse.json({ invites: pending, total_count: pending.length })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list invitations' },
      { status: 500 }
    )
  }
}

/**
 * POST /fakeApi/calendars/teams/invites
 * Sends a new team calendar invitation.
 * Body: { team_id, invitee_email, share_level? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.team_id || !body?.invitee_email) {
      return NextResponse.json(
        { error: 'team_id and invitee_email are required' },
        { status: 400 }
      )
    }

    const teams = getDemoData(
      req,
      TEAMS_COOKIE,
      DEFAULT_TEAM_CALENDARS
    ) as Array<{ id: string; name: string }>
    const team = teams.find((t) => t.id === body.team_id)
    if (!team) {
      return NextResponse.json(
        { error: 'Team calendar not found' },
        { status: 404 }
      )
    }

    const invites = getDemoData(req, INVITES_COOKIE, DEFAULT_TEAM_INVITES)
    if (
      invites.some(
        (i) =>
          i.team_id === body.team_id &&
          i.invitee_email === body.invitee_email &&
          i.status === 'pending'
      )
    ) {
      return NextResponse.json(
        { error: 'Invitation already exists' },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const newInvite = {
      id: `invite-${Date.now()}`,
      team_id: body.team_id,
      team_name: team.name,
      inviter_id: 'user-1',
      invitee_email: body.invitee_email,
      share_level: body.share_level ?? 'viewer',
      status: 'pending',
      created_at: now,
      expires_at: expires,
    }

    const response = NextResponse.json(newInvite, { status: 201 })
    setDemoData(response, INVITES_COOKIE, [...invites, newInvite], req)
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}