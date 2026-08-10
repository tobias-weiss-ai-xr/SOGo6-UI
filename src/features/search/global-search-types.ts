// ── Global Quick Search (Cmd+K) types ──────────────────────────────────

export interface GlobalSearchContact {
  key: string
  addressbook_key: string
  fullname: string
  email: string
}

export interface GlobalSearchEvent {
  key: string
  calendar_key: string
  title: string
  date_start: string | null
  date_end: string | null
}

export interface GlobalSearchUser {
  uid: string
  cn: string
  mail: string
}

export interface GlobalSearchResult {
  contacts: GlobalSearchContact[]
  events: GlobalSearchEvent[]
  users: GlobalSearchUser[]
}

export interface GlobalSearchArg {
  q: string
  limit?: number
}
