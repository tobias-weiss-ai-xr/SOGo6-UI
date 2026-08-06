import { addNotification } from '@/features/notifications'
import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  TeamCalendar,
  TeamCalendarCreateBody,
  TeamCalendarUpdateBody,
  TeamCalendarMember,
  TeamCalendarInvite,
  TeamCalendarAddMemberBody,
  TeamCalendarUpdateMemberBody,
} from '../team-calendars-types'

// Local tag constants (kept in-slice like resources-api to stay mock-friendly)
const TEAM_CALENDARS_SLICE = 'team_calendars'
const TEAM_CALENDAR_MEMBERS_SLICE = 'team_calendar_members'
const TEAM_CALENDAR_INVITES_SLICE = 'team_calendar_invites'

/**
 * Team Calendars RTK Query API (spec: team-calendars).
 *
 * Backend routes (all under the API base URL):
 *   GET/POST    /calendars/teams
 *   GET/PATCH/DELETE /calendars/teams/{team_id}
 *   GET/POST    /calendars/teams/{team_id}/members
 *   PATCH/DELETE /calendars/teams/{team_id}/members/{member_uid}
 *   POST        /calendars/teams/{team_id}/invites
 *   GET         /calendars/teams/invites
 *   GET/DELETE  /calendars/teams/invites/{invite_id}
 *   POST        /calendars/teams/invites/{invite_id}/accept|reject
 */

const teamUrl = (teamId: string) => `calendars/teams/${teamId}`

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    // ── Team calendar CRUD ──────────────────────────────────────────
    listTeamCalendars: builder.query<{ calendars: TeamCalendar[]; total_count: number }, void>({
      query: () => ({ url: 'calendars/teams' }),
      providesTags: () => [{ type: TEAM_CALENDARS_SLICE, id: 'LIST' }],
    }),
    getTeamCalendar: builder.query<TeamCalendar, string>({
      query: (teamId) => ({ url: teamUrl(teamId) }),
      providesTags: (_r, _e, teamId) => [{ type: TEAM_CALENDARS_SLICE, id: teamId }],
    }),
    createTeamCalendar: builder.mutation<TeamCalendar, TeamCalendarCreateBody>({
      query: (body) => ({ url: 'calendars/teams', method: 'POST', body }),
      invalidatesTags: () => [{ type: TEAM_CALENDARS_SLICE, id: 'LIST' }],
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'Team calendar created',
          errorTitle: 'Failed to create team calendar',
        })(undefined, { queryFulfilled })
      },
    }),
    updateTeamCalendar: builder.mutation<TeamCalendar, { teamId: string; body: TeamCalendarUpdateBody }>({
      query: ({ teamId, body }) => ({ url: teamUrl(teamId), method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { teamId }) => [
        { type: TEAM_CALENDARS_SLICE, id: teamId },
        { type: TEAM_CALENDARS_SLICE, id: 'LIST' },
      ],
    }),
    deleteTeamCalendar: builder.mutation<unknown, string>({
      query: (teamId) => ({ url: teamUrl(teamId), method: 'DELETE' }),
      invalidatesTags: () => [{ type: TEAM_CALENDARS_SLICE, id: 'LIST' }],
      async onQueryStarted(_teamId, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'Team calendar deleted',
          errorTitle: 'Failed to delete team calendar',
        })(undefined, { queryFulfilled })
      },
    }),

    // ── Membership ──────────────────────────────────────────────────
    listTeamMembers: builder.query<{ members: TeamCalendarMember[]; total_count: number }, string>({
      query: (teamId) => ({ url: `${teamUrl(teamId)}/members` }),
      providesTags: (_r, _e, teamId) => [{ type: TEAM_CALENDAR_MEMBERS_SLICE, id: teamId }],
    }),
    addTeamMember: builder.mutation<TeamCalendarMember, { teamId: string; body: TeamCalendarAddMemberBody }>({
      query: ({ teamId, body }) => ({ url: `${teamUrl(teamId)}/members`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: TEAM_CALENDAR_MEMBERS_SLICE, id: teamId }],
    }),
    updateTeamMember: builder.mutation<
      TeamCalendarMember,
      { teamId: string; memberUid: string; body: TeamCalendarUpdateMemberBody }
    >({
      query: ({ teamId, memberUid, body }) => ({
        url: `${teamUrl(teamId)}/members/${memberUid}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: TEAM_CALENDAR_MEMBERS_SLICE, id: teamId }],
    }),
    removeTeamMember: builder.mutation<unknown, { teamId: string; memberUid: string }>({
      query: ({ teamId, memberUid }) => ({
        url: `${teamUrl(teamId)}/members/${memberUid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { teamId }) => [{ type: TEAM_CALENDAR_MEMBERS_SLICE, id: teamId }],
    }),

    // ── Invitations ─────────────────────────────────────────────────
    inviteToTeamCalendar: builder.mutation<TeamCalendarInvite, { teamId: string; body: TeamCalendarAddMemberBody }>({
      query: ({ teamId, body }) => ({ url: `${teamUrl(teamId)}/invites`, method: 'POST', body }),
      invalidatesTags: () => [{ type: TEAM_CALENDAR_INVITES_SLICE, id: 'LIST' }],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'Invitation sent',
          errorTitle: 'Failed to send invitation',
        })(undefined, { queryFulfilled })
      },
    }),
    listPendingInvites: builder.query<{ invites: TeamCalendarInvite[]; total_count: number }, void>({
      query: () => ({ url: 'calendars/teams/invites' }),
      providesTags: () => [{ type: TEAM_CALENDAR_INVITES_SLICE, id: 'LIST' }],
    }),
    getInvite: builder.query<TeamCalendarInvite, string>({
      query: (inviteId) => ({ url: `calendars/teams/invites/${inviteId}` }),
      providesTags: (_r, _e, inviteId) => [{ type: TEAM_CALENDAR_INVITES_SLICE, id: inviteId }],
    }),
    cancelInvite: builder.mutation<TeamCalendarInvite, string>({
      query: (inviteId) => ({ url: `calendars/teams/invites/${inviteId}`, method: 'DELETE' }),
      invalidatesTags: () => [{ type: TEAM_CALENDAR_INVITES_SLICE, id: 'LIST' }],
    }),
    acceptInvite: builder.mutation<TeamCalendarMember, string>({
      query: (inviteId) => ({ url: `calendars/teams/invites/${inviteId}/accept`, method: 'POST' }),
      invalidatesTags: () => [
        { type: TEAM_CALENDAR_INVITES_SLICE, id: 'LIST' },
        { type: TEAM_CALENDARS_SLICE, id: 'LIST' },
      ],
      async onQueryStarted(_inviteId, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'Invitation accepted',
          errorTitle: 'Failed to accept invitation',
        })(undefined, { queryFulfilled })
      },
    }),
    rejectInvite: builder.mutation<TeamCalendarInvite, string>({
      query: (inviteId) => ({ url: `calendars/teams/invites/${inviteId}/reject`, method: 'POST' }),
      invalidatesTags: () => [{ type: TEAM_CALENDAR_INVITES_SLICE, id: 'LIST' }],
      async onQueryStarted(_inviteId, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'Invitation rejected',
          errorTitle: 'Failed to reject invitation',
        })(undefined, { queryFulfilled })
      },
    }),
  }),
})

export const {
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
} = injectedEndpoints

export const teamCalendarsApiEndpoints = injectedEndpoints
