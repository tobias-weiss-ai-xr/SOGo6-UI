/**
 * Team Calendars feature types (spec: team-calendars).
 */

export type TeamCalendarShareLevel =
  | 'view_date_time'
  | 'view_all'
  | 'respond'
  | 'modify_if_org'
  | 'modify'

export type TeamCalendarInviteStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export interface TeamCalendar {
  key: string
  name: string
  color: string | null
  description: string | null
  timezone: string
  is_default: boolean
  source_type: string
  ctag: number
  include_in_freebusy: boolean
  public_url: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TeamCalendarCreateBody {
  name: string
  color?: string | null
  description?: string | null
  timezone?: string
}

export interface TeamCalendarUpdateBody {
  name?: string | null
  color?: string | null
  description?: string | null
  timezone?: string | null
}

export interface TeamCalendarMember {
  user_uid: string
  share_level: TeamCalendarShareLevel
  can_create: boolean
  can_delete: boolean
}

export interface TeamCalendarAddMemberBody {
  user_uid: string
  share_level?: TeamCalendarShareLevel
}

export interface TeamCalendarUpdateMemberBody {
  share_level: TeamCalendarShareLevel
}

export interface TeamCalendarInvite {
  id: string
  calendar_key: string
  user_uid: string
  invited_by: string
  status: TeamCalendarInviteStatus
  share_level: TeamCalendarShareLevel
  created_at: string | null
}
