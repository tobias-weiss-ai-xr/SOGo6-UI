export interface DnsRecord {
  name: string
  type: string
  value: string
  ttl: number
  selector?: string
  description: string
}

export interface DnsValidation {
  valid: boolean
  warnings: string[]
  errors: string[]
}
