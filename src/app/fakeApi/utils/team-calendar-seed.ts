// @ts-nocheck
/**
 * Team Calendar demo data — default seed used by the fake API routes.
 * Mirrors the `TeamCalendar`/`TeamCalendarMember`/`TeamCalendarInvite`
 * shapes from `src/features/team-calendars/team-calendars-types.ts`.
 */
export const DEFAULT_TEAM_CALENDARS = [
  {
    id: 'team-1',
    name: 'Engineering Team',
    description: 'Shared calendar for the engineering squad',
    color: '#4f46e5',
    owner_id: 'user-1',
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-06-01T10:30:00Z',
  },
  {
    id: 'team-2',
    name: 'Design Team',
    description: 'Design reviews and handoffs',
    color: '#0ea5e9',
    owner_id: 'user-2',
    created_at: '2025-02-14T09:00:00Z',
    updated_at: '2025-05-20T16:00:00Z',
  },
]

export const DEFAULT_TEAM_MEMBERS: Record<string, unknown[]> = {
  'team-1': [
    {
      id: 'member-1',
      team_id: 'team-1',
      user_id: 'user-1',
      display_name: 'Alex Chen',
      email: 'alex@example.com',
      share_level: 'owner',
      joined_at: '2025-01-10T09:00:00Z',
    },
    {
      id: 'member-2',
      team_id: 'team-1',
      user_id: 'user-2',
      display_name: 'Sam Rivera',
      email: 'sam@example.com',
      share_level: 'editor',
      joined_at: '2025-01-12T09:00:00Z',
    },
  ],
  'team-2': [
    {
      id: 'member-3',
      team_id: 'team-2',
      user_id: 'user-2',
      display_name: 'Sam Rivera',
      email: 'sam@example.com',
      share_level: 'owner',
      joined_at: '2025-02-14T09:00:00Z',
    },
  ],
}

export const DEFAULT_TEAM_INVITES = [
  {
    id: 'invite-1',
    team_id: 'team-1',
    team_name: 'Engineering Team',
    inviter_id: 'user-1',
    invitee_email: 'newhire@example.com',
    share_level: 'viewer',
    status: 'pending',
    created_at: '2025-07-01T09:00:00Z',
    expires_at: '2025-08-01T09:00:00Z',
  },
]
