export interface Resource {
  id: string
  name: string
  description: string
  email: string
  resource_type: string
  capacity: number | null
  location: string | null
  features: string[]
  is_active: boolean
  booking_policy: string
  allowed_groups: string[]
  auto_accept: boolean
  created_at: string | null
  updated_at: string | null
}
