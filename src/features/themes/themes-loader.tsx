'use client'

import { useEffect } from 'react'
import { useGetThemesQuery } from './store/themes-api'

export function ThemesLoader() {
  const { data: theme } = useGetThemesQuery()

  useEffect(() => {
    // Example: fetch theme from API

    // Inject CSS string (can include :root or classes)
    if (theme) {
      let styleTag = document.getElementById('dynamic-theme')
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = 'dynamic-theme'
        document.head.appendChild(styleTag)
      }
      styleTag.innerHTML =
        typeof theme === 'string'
          ? theme
          : theme && typeof theme === 'object' && 'cssRules' in theme && Array.isArray((theme as any).cssRules)
            ? Array.from((theme as any).cssRules as CSSRule[])
                .map((rule: CSSRule) => rule.cssText)
                .join('\n')
            : ''
    }
  }, [theme])

  return null
}
