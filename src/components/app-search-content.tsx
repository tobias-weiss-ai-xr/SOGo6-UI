/**
 * AppSearchContent — Global search component for SOGo 6 UI.
 *
 * Provides a search input with results display across mail, contacts,
 * and calendar items. Currently renders the UI shell; the actual search
 * API endpoint is being built on the backend side.
 *
 * @see {@link https://github.com/tobias-weiss-ai-xr/sogo6-server/issues/search-api}
 */
'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

interface SearchResult {
  id: string
  type: 'mail' | 'contact' | 'calendar' | 'file'
  title: string
  subtitle?: string
  url?: string
}

interface AppSearchContentProps {
  /** Placeholder for future API-driven results */
  initialResults?: SearchResult[]
  onSearch?: (query: string) => Promise<SearchResult[]> | SearchResult[]
  placeholder?: string
}

export function AppSearchContent({
  initialResults = [],
  onSearch,
  placeholder = 'Search mail, contacts, calendar…',
}: AppSearchContentProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>(initialResults)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value)
      if (!value || value.length < 2) {
        setResults([])
        return
      }

      if (onSearch) {
        setIsSearching(true)
        try {
          const res = await Promise.resolve(onSearch(value))
          setResults(res)
        } catch (error) {
          logger.error('Search failed', { error: String(error) })
          setResults([])
        } finally {
          setIsSearching(false)
        }
      }
    },
    [onSearch]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  const hasResults = results.length > 0
  const showResults = query.length >= 2 && (hasResults || !isSearching)

  return (
    <div className="relative w-full max-w-lg" role="search" aria-label="Global search">
      {/* Search input */}
      <div className="relative flex items-center">
        <Search
          className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          aria-label={placeholder}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 h-7 w-7"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search results */}
      {showResults && (
        <div
          className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md z-50"
          role="listbox"
          aria-label="Search results"
        >
          {isSearching && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching…
            </div>
          )}

          {!isSearching && results.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-3 px-4 py-2 hover:bg-accent cursor-pointer"
              role="option"
              aria-selected={false}
              onClick={() => {
                if (result.url) {
                  window.location.href = result.url
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{result.title}</div>
                {result.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground capitalize">
                {result.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppSearchContent
