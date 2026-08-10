// Email Authentication (DKIM/DMARC/SPF) types — admin panel

export type AuthStatus = 'ok' | 'warning' | 'error' | 'none'

export interface EmailAuthDomain {
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmailAuthDomainStatus {
  domain: string
  dkim_status: AuthStatus
  dkim_status_msg: string
  dmarc_status: AuthStatus
  dmarc_status_msg: string
  spf_status: AuthStatus
  spf_status_msg: string
  overall_status: AuthStatus
  overall_recommendations: string[]
}

export interface DkimKeyPair {
  private_key: string
  public_key: string
  key_type: string
  key_length: string
  public_key_fingerprint: string
}

export interface DkimConfig {
  domain: string
  selector: string
  enabled: boolean
  key_length: number
  signing_algorithm: string
  headers_to_sign?: string[] | null
  notes: string
  public_key?: string | null
  dns_record?: DnsRecordPayload | null
  created_at: string
  updated_at: string
}

export interface DnsRecordPayload {
  name: string
  type: string
  value: string
  ttl: number
  selector?: string
  description: string
}

export interface DmarcConfig {
  domain: string
  enabled: boolean
  policy: 'none' | 'quarantine' | 'reject'
  subdomain_policy?: 'none' | 'quarantine' | 'reject' | null
  pct: number
  aspf: 'r' | 's'
  adkim: 'r' | 's'
  rua: string[]
  ruf: string[]
  ri: number
  notes: string
  record_value?: string | null
  created_at: string
  updated_at: string
}

export interface SpfConfig {
  domain: string
  enabled: boolean
  include_mechanisms: string[]
  ip4_mechanisms: string[]
  ip6_mechanisms: string[]
  a_mechanisms: string[]
  mx_mechanisms: string[]
  exists_mechanisms: string[]
  raw_mail_servers?: string | null
  all_qualifier: '+all' | '-all' | '~all' | '?all'
  redirect_modifier?: string | null
  explanation_modifier?: string | null
  notes: string
  record_value?: string | null
  created_at: string
  updated_at: string
}

export interface DkimValidation {
  domain: string
  selector: string
  is_valid: boolean
  errors: string[]
  warnings: string[]
  dns_record_found: boolean
  record_value?: string | null
  expected_value?: string | null
  dns_lookup_available: boolean
  checked_at: string
}

export interface DmarcValidation {
  domain: string
  is_valid: boolean
  errors: string[]
  warnings: string[]
  dns_record_found: boolean
  record_value?: string | null
  expected_record?: string | null
  dns_lookup_available: boolean
  checked_at: string
}

export interface SpfValidation {
  domain: string
  is_valid: boolean
  errors: string[]
  warnings: string[]
  dns_record_found: boolean
  record_value?: string | null
  expected_record?: string | null
  mechanism_count: number
  dns_lookup_count: number
  over_lookup_limit: boolean
  dns_lookup_available: boolean
  checked_at: string
}

export interface DmarcAggregateReport {
  report_metadata: {
    org_name?: string | null
    email?: string | null
    report_id?: string | null
    date_range_begin?: string | null
    date_range_end?: string | null
  }
  policy_published?: {
    domain?: string | null
    adkim?: string | null
    aspf?: string | null
    p?: string | null
    sp?: string | null
    pct?: number
  } | null
  records: Array<{
    source_ip?: string | null
    count: number
    disposition?: string | null
    dkim?: string | null
    spf?: string | null
    header_from?: string | null
  }>
}

export interface EmailAuthTestResult {
  sent: boolean
  smtp_response: string
  domain: string
  from_address: string
  timestamp: string
}
