/**
 * Calendar API Endpoints
 * All endpoints under /api/user/v1/calendar/*
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * Calendar
 */
export interface Calendar {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  bg_color: string;
  border_color: string;
  is_active: boolean;
  is_shared: boolean;
  is_subscribed: boolean;
  is_primary: boolean;
  external_id: string | null;
  external_type: 'caldav' | 'ics' | 'google' | 'outlook' | null;
  sync_state: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
  };
  order: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

/**
 * Calendar Event
 */
export interface CalendarEvent {
  id: string;
  calendar_id: string;
  uid: string; // iCalendar UID
  title: string;
  description: string | null;
  location: string | null;
  start: {
    date: string;
    time: string | null;
    timezone: string | null;
    is_all_day: boolean;
  };
  end: {
    date: string;
    time: string | null;
    timezone: string | null;
    is_all_day: boolean;
  };
  recurrence: {
    rule: string | null; // RRULE
    exceptions: string[]; // EXDATE values
    end_date: string | null; // RECURRENCE-END
  } | null;
  is_all_day: boolean;
  priority: number | null; // 1 (highest) to 9 (lowest)
  classification: 'public' | 'private' | 'confidential';
  transparency: 'opaque' | 'transparent';
  status: 'confirmed' | 'tentative' | 'cancelled';
  organizer: { name: string; email: string };
  attendees: CalendarAttendee[];
  alarms: CalendarAlarm[];
  categories: string[];
  attachments: CalendarAttachment[];
  created_at: string;
  updated_at: string;
  sequence: number;
}

/**
 * Calendar Event Summary (for list views)
 */
export interface CalendarEventSummary {
  id: string;
  calendar_id: string;
  title: string;
  start: string;
  end: string;
  is_all_day: boolean;
  classification: 'public' | 'private' | 'confidential';
  status: 'confirmed' | 'tentative' | 'cancelled';
  color: string;
  bg_color: string;
  recurrence: boolean;
  has_alarms: boolean;
}

/**
 * Calendar Attendee
 */
export interface CalendarAttendee {
  email: string;
  name: string | null;
  role: 'organizer' | 'required' | 'optional' | 'non-participant' | 'chair';
  participation_status: 'needs-action' | 'accepted' | 'tentative' | 'declined' | 'delegated';
  rsvp: boolean;
  delegated_to: string[] | null;
  delegated_from: string | null;
}

/**
 * Calendar Alarm/Reminder
 */
export interface CalendarAlarm {
  id: string;
  trigger: {
    type: 'relative' | 'absolute' | 'none';
    value: string; // e.g., "-PT15M" (15 minutes before) or "2024-01-01T12:00:00Z"
  };
  action: 'display' | 'email' | 'audio';
  description: string | null;
  repeat: number | null; // Number of times to repeat
  duration: string | null; // Duration between repeats (e.g., "PT5M")
}

/**
 * Calendar Attachment
 */
export interface CalendarAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  url: string;
  is_inline: boolean;
}

/**
 * Free/Busy Information
 */
export interface FreeBusyInfo {
  user_id: string;
  email: string;
  busy_periods: Array<{
    start: string;
    end: string;
    event_id: string | null;
    status: 'busy' | 'tentative' | 'oof';
  }>;
}

/**
 * Appointment Slot
 */
export interface AppointmentSlot {
  id: string;
  calendar_id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  duration: number; // in minutes
  minimum_booking_time: number | null;
  maximum_booking_time: number | null;
  buffer_before: number | null;
  buffer_after: number | null;
  is_active: boolean;
  booking_url: string | null;
  remaining_slots: number;
  total_slots: number;
}

/**
 * Scheduling Poll
 */
export interface SchedulingPoll {
  id: string;
  title: string;
  description: string | null;
  organizer: { name: string; email: string };
  options: Array<{
    id: string;
    start: string;
    end: string;
    timezone: string;
  }>;
  participants: Array<{
    email: string;
    name: string | null;
    votes: string[]; // option IDs
    responded_at: string | null;
  }>;
  is_closed: boolean;
  expiration: string | null;
  voting_url: string;
  results_url: string;
}

/**
 * Create event request
 */
export interface CreateEventRequest {
  calendar_id: string;
  title: string;
  description?: string;
  location?: string;
  start: {
    date: string;
    time?: string;
    timezone?: string;
    is_all_day?: boolean;
  };
  end: {
    date: string;
    time?: string;
    timezone?: string;
    is_all_day?: boolean;
  };
  recurrence?: {
    rule: string;
    end_date?: string;
  };
  is_all_day?: boolean;
  priority?: number;
  classification?: 'public' | 'private' | 'confidential';
  transparency?: 'opaque' | 'transparent';
  status?: 'confirmed' | 'tentative' | 'cancelled';
  attendees?: Omit<CalendarAttendee, 'participation_status' | 'rsvp'>[];
  alarms?: Omit<CalendarAlarm, 'id'>[];
  categories?: string[];
}

/**
 * Update event request
 */
export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

/**
 * Time range for free/busy query
 */
export interface FreeBusyQuery {
  start: string;
  end: string;
  emails: string[];
  timezone?: string;
}

// ========== Calendar API Class ==========

/**
 * Calendar API Client
 * Handles all calendar-related endpoints
 */
export class CalendarApi {
  /**
   * List all calendars
   */
  async listCalendars(include_shared: boolean = false, include_subscribed: boolean = true): Promise<Calendar[]> {
    const response = await apiClient.get<BackendResponse<Calendar[]>>(
      '/api/user/v1/calendar/calendars',
      { 
        params: {
          include_shared: include_shared ? '1' : '0',
          include_subscribed: include_subscribed ? '1' : '0'
        }
      }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific calendar
   */
  async getCalendar(calendarId: string): Promise<Calendar> {
    const response = await apiClient.get<BackendResponse<Calendar>>(
      `/api/user/v1/calendar/calendars/${calendarId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new calendar
   */
  async createCalendar(data: Omit<Calendar, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'permissions' | 'sync_state'> & { name: string }): Promise<Calendar> {
    const response = await apiClient.post<BackendResponse<Calendar>>(
      '/api/user/v1/calendar/calendars',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update a calendar
   */
  async updateCalendar(calendarId: string, data: Partial<Calendar>): Promise<Calendar> {
    const response = await apiClient.put<BackendResponse<Calendar>>(
      `/api/user/v1/calendar/calendars/${calendarId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete a calendar
   */
  async deleteCalendar(calendarId: string, purge_events: boolean = false): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean; message: string }>>(
      `/api/user/v1/calendar/calendars/${calendarId}`,
      { params: { purge_events: purge_events ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List events in a calendar
   */
  async listEvents(
    calendarId: string,
    params: {
      start: string;
      end: string;
      limit?: number;
      offset?: number;
      includes_recurring?: boolean;
      categorized?: boolean;
    }
  ): Promise<{ events: CalendarEventSummary[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ events: CalendarEventSummary[]; total: number }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/events`,
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List events across all calendars
   */
  async listAllEvents(params: {
    start: string;
    end: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: CalendarEventSummary[]; total: number }> {
    const response = await apiClient.get<BackendResponse<{ events: CalendarEventSummary[]; total: number }>>(
      '/api/user/v1/calendar/events',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific event
   */
  async getEvent(calendarId: string, eventId: string): Promise<CalendarEvent> {
    const response = await apiClient.get<BackendResponse<CalendarEvent>>(
      `/api/user/v1/calendar/calendars/${calendarId}/events/${eventId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create a new event
   */
  async createEvent(data: Omit<CreateEventRequest, 'id'>): Promise<CalendarEvent> {
    // Default to primary calendar if not specified
    if (!data.calendar_id) {
      const calendars = await this.listCalendars();
      const primary = calendars.find(c => c.is_primary);
      if (primary) {
        data.calendar_id = primary.id;
      }
    }
    
    const response = await apiClient.post<BackendResponse<CalendarEvent>>(
      '/api/user/v1/calendar/events',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: string, data: Partial<UpdateEventRequest>): Promise<CalendarEvent> {
    // Find which calendar the event belongs to
    const response = await apiClient.put<BackendResponse<CalendarEvent>>(
      `/api/user/v1/calendar/events/${eventId}`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string, send_cancellation: boolean = true): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/calendar/events/${eventId}`,
      { params: { send_cancellation: send_cancellation ? '1' : '0' } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get free/busy information
   */
  async getFreeBusy(query: FreeBusyQuery): Promise<FreeBusyInfo[]> {
    const response = await apiClient.get<BackendResponse<FreeBusyInfo[]>>(
      '/api/user/v1/calendar/freebusy',
      { params: query as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Manage event attendees
   */
  async manageAttendees(
    calendarId: string,
    eventId: string,
    data: {
      action: 'add' | 'remove' | 'update';
      attendees: Array<Omit<CalendarAttendee, 'participation_status' | 'rsvp'> & {
        participation_status?: 'needs-action' | 'accepted' | 'tentative' | 'declined' | 'delegated';
      }>;
    }
  ): Promise<{ success: boolean; attendees: CalendarAttendee[] }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; attendees: CalendarAttendee[] }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/events/${eventId}/attendees`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * RSVP to an event invtitation
   */
  async rsvpToEvent(
    calendarId: string,
    eventId: string,
    data: {
      attendee_email: string;
      participation_status: 'needs-action' | 'accepted' | 'tentative' | 'declined';
      comment?: string;
    }
  ): Promise<{ success: boolean; event: CalendarEvent }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; event: CalendarEvent }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/events/${eventId}/rsvp`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Send event invitation to additional attendees
   */
  async sendInvitation(
    calendarId: string,
    eventId: string,
    attendees: Omit<CalendarAttendee, 'participation_status' | 'rsvp'>[],
    message?: string
  ): Promise<{ success: boolean; sent_count: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; sent_count: number }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/events/${eventId}/invite`,
      { attendees, message }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Create time range for event
   */
  async createEventTimeRange(
    calendarId: string,
    eventId: string,
    data: {
      start: string;
      end: string;
      timezone?: string;
    }
  ): Promise<{ success: boolean; event: CalendarEvent }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; event: CalendarEvent }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/events/${eventId}/times`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Appointment Slots ==========

  /**
   * Create appointment slots
   */
  async createAppointmentSlots(data: Omit<AppointmentSlot, 'id' | 'booking_url' | 'remaining_slots' | 'total_slots'> & { calendar_id: string }): Promise<AppointmentSlot> {
    const response = await apiClient.post<BackendResponse<AppointmentSlot>>(
      '/api/user/v1/calendar/appointment-slots',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List appointment slots
   */
  async listAppointmentSlots(calendarId?: string): Promise<AppointmentSlot[]> {
    const params: Record<string, string> = {};
    if (calendarId) {
      params.calendar_id = calendarId;
    }
    
    const response = await apiClient.get<BackendResponse<AppointmentSlot[]>>(
      '/api/user/v1/calendar/appointment-slots',
      { params }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific appointment slot
   */
  async getAppointmentSlot(slotId: string): Promise<AppointmentSlot> {
    const response = await apiClient.get<BackendResponse<AppointmentSlot>>(
      `/api/user/v1/calendar/appointment-slots/${slotId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Delete appointment slot
   */
  async deleteAppointmentSlot(slotId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/calendar/appointment-slots/${slotId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Scheduling Polls ==========

  /**
   * Create a scheduling poll
   */
  async createSchedulingPoll(data: Omit<SchedulingPoll, 'id' | 'organizer' | 'voting_url' | 'results_url' | 'participants' | 'is_closed'>): Promise<SchedulingPoll> {
    const response = await apiClient.post<BackendResponse<SchedulingPoll>>(
      '/api/user/v1/calendar/scheduling-polls',
      data as any
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * List scheduling polls
   */
  async listSchedulingPolls(): Promise<SchedulingPoll[]> {
    const response = await apiClient.get<BackendResponse<SchedulingPoll[]>>(
      '/api/user/v1/calendar/scheduling-polls'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get a specific scheduling poll
   */
  async getSchedulingPoll(pollId: string): Promise<SchedulingPoll> {
    const response = await apiClient.get<BackendResponse<SchedulingPoll>>(
      `/api/user/v1/calendar/scheduling-polls/${pollId}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Vote on scheduling poll options
   */
  async voteOnPoll(
    pollId: string,
    data: {
      name: string;
      email: string;
      votes: string[]; // Option IDs
    }
  ): Promise<{ success: boolean; poll: SchedulingPoll }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; poll: SchedulingPoll }>>(
      `/api/user/v1/calendar/scheduling-polls/${pollId}/vote`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Close a scheduling poll
   */
  async closePoll(pollId: string): Promise<{ success: boolean; poll: SchedulingPoll }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; poll: SchedulingPoll }>>(
      `/api/user/v1/calendar/scheduling-polls/${pollId}/close`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Calendar Sharing ==========

  /**
   * Share a calendar with other users
   */
  async shareCalendar(
    calendarId: string,
    data: {
      user_emails: string[];
      permissions: 'read' | 'write' | 'delete' | 'share' | 'all';
      send_notification?: boolean;
    }
  ): Promise<{ success: boolean; shared_with: string[] }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; shared_with: string[] }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/share`,
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Unshare a calendar
   */
  async unshareCalendar(
    calendarId: string,
    userEmail: string
  ): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/share/${userEmail}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get calendar sharing information
   */
  async getCalendarSharing(calendarId: string): Promise<{
    owner: string;
    shared_with: Array<{
      email: string;
      permissions: string[];
      shared_at: string;
    }>;
  }> {
    const response = await apiClient.get<BackendResponse<{
      owner: string;
      shared_with: Array<{
        email: string;
        permissions: string[];
        shared_at: string;
      }>;
    }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/share`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  // ========== Subscribe to External Calendar ==========

  /**
   * Subscribe to an external calendar (ICS, CalDAV, Google, Outlook)
   */
  async subscribeToCalendar(data: {
    url: string;
    type: 'ics' | 'caldav' | 'google' | 'outlook';
    name?: string;
    color?: string;
    bg_color?: string;
    username?: string;
    password?: string;
    sync_interval_minutes?: number;
  }): Promise<Calendar> {
    const response = await apiClient.post<BackendResponse<Calendar>>(
      '/api/user/v1/calendar/calendars/subscribe',
      data
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Unsubscribe from an external calendar
   */
  async unsubscribeCalendar(calendarId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<BackendResponse<{ success: boolean }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/unsubscribe`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Force sync of external calendar
   */
  async syncCalendar(calendarId: string): Promise<{ success: boolean; synced_items: number }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; synced_items: number }>>(
      `/api/user/v1/calendar/calendars/${calendarId}/sync`
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton Calendar API instance
 */
export const calendarApi = new CalendarApi();

export default calendarApi;
