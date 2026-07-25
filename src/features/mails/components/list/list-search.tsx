'use client'

import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { useRef, useCallback } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ListSearchProps {
  /** The current search query */
  value: string
  /** Whether a search is active */
  isSearching: boolean
  /** Called when the user types in the search field */
  onChange: (query: string) => void
  /** Called to clear the search */
  onClear: () => void
}

/**
 * A search bar for the mail list toolbar.
 * Searches within the current folder when the user types a query.
 */
export function ListSearch({ value, isSearching, onChange, onClear }: ListSearchProps) {
  const t = useTranslations('MAILS_COMMONS')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <div className="relative flex items-center">
      <SearchIcon className="text-muted-foreground absolute left-2 size-4 shrink-0" />
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={t('search.placeholder.string')}
        className="h-8 w-48 pl-8 pr-8 text-sm"
      />
      {isSearching && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 h-8 w-8"
          onClick={onClear}
          aria-label="Clear search"
        >
          <XIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}

export default ListSearch
