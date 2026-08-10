import { headers } from 'next/headers'
import { logger } from '@/lib/logger'

export async function getThemesServer(): Promise<string | null> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    // Use X-Forwarded-Proto from reverse proxy, fallback to NODE_ENV check
    const protocol =
      headersList.get('x-forwarded-proto') ||
      (process.env.NODE_ENV === 'production' ? 'https' : 'http')

    const response = await fetch(
      `${protocol}://${host}/api/user/v1/customization/themes`,
      {
        cache: 'force-cache', // Cache the themes data
      }
    )

    if (!response.ok) {
      logger.error('Failed to fetch themes', { status: response.status, statusText: response.statusText })
      return null
    }

    const themes = await response.json()
    return themes
  } catch (error) {
    logger.error('Error fetching themes on server', { error: String(error) })
    return null
  }
}
