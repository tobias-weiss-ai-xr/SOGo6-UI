'use client'

import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

/**
 * Applies the server-side SOGO_U_THEME preference once preferences load
 * (and on later changes). The server preference wins over the local
 * next-themes state so the look follows the user across devices; before
 * preferences resolve, next-themes' localStorage gives the instant boot.
 */
export function ClassicThemeSync() {
  const { data } = useGetUserPreferencesQuery()
  const { setTheme } = useTheme()

  const pref = data?.data?.USER_GENERAL?.SOGO_U_THEME

  useEffect(() => {
    if (pref === 'sogo5-classic') setTheme('sogo5-classic')
    else if (pref === 'default') setTheme('light')
  }, [pref, setTheme])

  return null
}
