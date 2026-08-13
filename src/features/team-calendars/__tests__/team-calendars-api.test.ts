/**
 * Unit tests for team-calendars-api.ts RTK Query endpoints
 * Team Calendars Feature - Tier 0 Foundation
 */

// Mock the api slice before importing
jest.mock('@/lib/redux/api/api-slice', () => {
  const mockInjectEndpoints = jest.fn()
  return {
    __mockInjectEndpoints: mockInjectEndpoints,
    apiSlice: {
      injectEndpoints: (config: any) => {
        mockInjectEndpoints(config)
        // The endpoints key is a builder function; invoke it with a stub builder
        const builder = {
          query: (definition: any) => ({ ...definition, __kind: 'query' }),
          mutation: (definition: any) => ({ ...definition, __kind: 'mutation' }),
        }
        const endpoints =
          typeof config.endpoints === 'function'
            ? config.endpoints(builder)
            : config.endpoints
        const hooks: Record<string, any> = {}
        Object.keys(endpoints).forEach(key => {
          const kind = (endpoints[key] as any)?.__kind ?? 'query'
          const suffix = kind === 'mutation' ? 'Mutation' : 'Query'
          hooks[`use${key[0].toUpperCase()}${key.slice(1)}${suffix}`] = jest.fn()
        })
        return {
          endpoints,
          ...hooks,
          injectedEndpoints: {
            endpoints,
            ...hooks,
          },
        }
      },
    },
  }
})

// Notification handler mock (used by mutations)
jest.mock('@/features/notifications/api-notification-handler', () => ({
  createApiNotificationHandler: () => async () => {},
}))
jest.mock('@/features/notifications', () => ({
  addNotification: jest.fn(),
}))

import { apiSlice as mockApiSlice } from '@/lib/redux/api/api-slice'

// Access the captured injectEndpoints config
const mockInject = (mockApiSlice.injectEndpoints as unknown as unknown as jest.Mock)

// Load the module under test AFTER the mock is registered (require ensures ordering)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const teamCalendarsApi = require('../store/team-calendars-api') as typeof import('../store/team-calendars-api')

// The mock returns the evaluated endpoints object (builder already invoked)
const endpoints = (teamCalendarsApi as any).teamCalendarsApiEndpoints?.endpoints ?? (teamCalendarsApi as any).endpoints as Record<string, any>

import {
  useListTeamCalendarsQuery,
  useGetTeamCalendarQuery,
  useCreateTeamCalendarMutation,
  useUpdateTeamCalendarMutation,
  useDeleteTeamCalendarMutation,
  useListTeamMembersQuery,
  useAddTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useInviteToTeamCalendarMutation,
  useListPendingInvitesQuery,
  useGetInviteQuery,
  useCancelInviteMutation,
  useAcceptInviteMutation,
  useRejectInviteMutation,
} from '../store/team-calendars-api'

describe('team-calendars-api endpoint definitions', () => {
  test('injects endpoints via apiSlice', () => {
    expect(teamCalendarsApi).toBeTruthy()
    expect(endpoints).toBeTruthy()
  })

  test('defines all 15 endpoints', () => {
    expect(Object.keys(endpoints)).toHaveLength(15)
    expect(endpoints).toHaveProperty('listTeamCalendars')
    expect(endpoints).toHaveProperty('getTeamCalendar')
    expect(endpoints).toHaveProperty('createTeamCalendar')
    expect(endpoints).toHaveProperty('updateTeamCalendar')
    expect(endpoints).toHaveProperty('deleteTeamCalendar')
    expect(endpoints).toHaveProperty('listTeamMembers')
    expect(endpoints).toHaveProperty('addTeamMember')
    expect(endpoints).toHaveProperty('updateTeamMember')
    expect(endpoints).toHaveProperty('removeTeamMember')
    expect(endpoints).toHaveProperty('inviteToTeamCalendar')
    expect(endpoints).toHaveProperty('listPendingInvites')
    expect(endpoints).toHaveProperty('getInvite')
    expect(endpoints).toHaveProperty('cancelInvite')
    expect(endpoints).toHaveProperty('acceptInvite')
    expect(endpoints).toHaveProperty('rejectInvite')
  })
})

describe('team calendar CRUD endpoints', () => {
  test('listTeamCalendars queries /calendars/teams', () => {
    const result = endpoints.listTeamCalendars.query()
    expect(result).toEqual({ url: 'calendars/teams' })
  })

  test('getTeamCalendar queries the detail route', () => {
    const result = endpoints.getTeamCalendar.query('team-1')
    expect(result).toEqual({ url: 'calendars/teams/team-1' })
  })

  test('createTeamCalendar POSTs the body', () => {
    const body = { name: 'Engineering', timezone: 'UTC' }
    const result = endpoints.createTeamCalendar.query(body)
    expect(result).toEqual({ url: 'calendars/teams', method: 'POST', body })
  })

  test('updateTeamCalendar PATCHes the team route', () => {
    const result = endpoints.updateTeamCalendar.query({ teamId: 'team-1', body: { name: 'Renamed' } })
    expect(result).toEqual({
      url: 'calendars/teams/team-1',
      method: 'PATCH',
      body: { name: 'Renamed' },
    })
  })

  test('deleteTeamCalendar DELETEs the team route', () => {
    const result = endpoints.deleteTeamCalendar.query('team-1')
    expect(result).toEqual({ url: 'calendars/teams/team-1', method: 'DELETE' })
  })

  test('createTeamCalendar invalidates the team list tag', () => {
    const tags = endpoints.createTeamCalendar.invalidatesTags()
    expect(tags).toEqual([{ type: 'team_calendars', id: 'LIST' }])
  })

  test('listTeamCalendars provides the list tag', () => {
    const tags = endpoints.listTeamCalendars.providesTags()
    expect(tags).toEqual([{ type: 'team_calendars', id: 'LIST' }])
  })
})

describe('membership endpoints', () => {
  test('listTeamMembers queries members route', () => {
    const result = endpoints.listTeamMembers.query('team-1')
    expect(result).toEqual({ url: 'calendars/teams/team-1/members' })
  })

  test('addTeamMember POSTs member body', () => {
    const result = endpoints.addTeamMember.query({
      teamId: 'team-1',
      body: { user_uid: 'alice@example.org', share_level: 'view_all' },
    })
    expect(result).toEqual({
      url: 'calendars/teams/team-1/members',
      method: 'POST',
      body: { user_uid: 'alice@example.org', share_level: 'view_all' },
    })
  })

  test('updateTeamMember PATCHes member route', () => {
    const result = endpoints.updateTeamMember.query({
      teamId: 'team-1',
      memberUid: 'alice@example.org',
      body: { share_level: 'modify' },
    })
    expect(result).toEqual({
      url: 'calendars/teams/team-1/members/alice@example.org',
      method: 'PATCH',
      body: { share_level: 'modify' },
    })
  })

  test('removeTeamMember DELETEs member route', () => {
    const result = endpoints.removeTeamMember.query({
      teamId: 'team-1',
      memberUid: 'alice@example.org',
    })
    expect(result).toEqual({
      url: 'calendars/teams/team-1/members/alice@example.org',
      method: 'DELETE',
    })
  })

  test('member endpoints invalidate the member tag for the team', () => {
    const tags = endpoints.addTeamMember.invalidatesTags(null as never, null as never, {
      teamId: 'team-1',
      body: {},
    })
    expect(tags).toEqual([{ type: 'team_calendar_members', id: 'team-1' }])
  })
})

describe('invitation endpoints', () => {
  test('inviteToTeamCalendar POSTs invite route', () => {
    const result = endpoints.inviteToTeamCalendar.query({
      teamId: 'team-1',
      body: { user_uid: 'bob@example.org', share_level: 'view_all' },
    })
    expect(result).toEqual({
      url: 'calendars/teams/team-1/invites',
      method: 'POST',
      body: { user_uid: 'bob@example.org', share_level: 'view_all' },
    })
  })

  test('listPendingInvites queries the invites list', () => {
    const result = endpoints.listPendingInvites.query()
    expect(result).toEqual({ url: 'calendars/teams/invites' })
  })

  test('getInvite queries the invite detail route', () => {
    const result = endpoints.getInvite.query('inv-1')
    expect(result).toEqual({ url: 'calendars/teams/invites/inv-1' })
  })

  test('cancelInvite DELETEs the invite route', () => {
    const result = endpoints.cancelInvite.query('inv-1')
    expect(result).toEqual({ url: 'calendars/teams/invites/inv-1', method: 'DELETE' })
  })

  test('acceptInvite POSTs the accept action', () => {
    const result = endpoints.acceptInvite.query('inv-1')
    expect(result).toEqual({ url: 'calendars/teams/invites/inv-1/accept', method: 'POST' })
  })

  test('rejectInvite POSTs the reject action', () => {
    const result = endpoints.rejectInvite.query('inv-1')
    expect(result).toEqual({ url: 'calendars/teams/invites/inv-1/reject', method: 'POST' })
  })

  test('acceptInvite invalidates invites and team list tags', () => {
    const tags = endpoints.acceptInvite.invalidatesTags()
    expect(tags).toContainEqual({ type: 'team_calendar_invites', id: 'LIST' })
    expect(tags).toContainEqual({ type: 'team_calendars', id: 'LIST' })
  })
})

describe('hooks are exported', () => {
  test('all mutation/query hooks are available', () => {
    expect(useListTeamCalendarsQuery).toBeDefined()
    expect(useGetTeamCalendarQuery).toBeDefined()
    expect(useCreateTeamCalendarMutation).toBeDefined()
    expect(useUpdateTeamCalendarMutation).toBeDefined()
    expect(useDeleteTeamCalendarMutation).toBeDefined()
    expect(useListTeamMembersQuery).toBeDefined()
    expect(useAddTeamMemberMutation).toBeDefined()
    expect(useUpdateTeamMemberMutation).toBeDefined()
    expect(useRemoveTeamMemberMutation).toBeDefined()
    expect(useInviteToTeamCalendarMutation).toBeDefined()
    expect(useListPendingInvitesQuery).toBeDefined()
    expect(useGetInviteQuery).toBeDefined()
    expect(useCancelInviteMutation).toBeDefined()
    expect(useAcceptInviteMutation).toBeDefined()
    expect(useRejectInviteMutation).toBeDefined()
  })
})
