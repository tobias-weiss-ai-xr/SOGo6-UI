'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  activateSearch,
  clearSearch,
  selectMailSearch,
} from '@/features/mails/store/mail-search-slice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import { SearchIcon, X } from 'lucide-react'
import SearchFolders from './search-folders'
import SearchMoreOptions from './search-more-options'

export interface MailsSearchProps {
  /** Current folder path (used to scope search if no folders specified) */
  folder?: string
  /** Current account ID */
  accountId?: string
}

export function MailsSearch({ folder, accountId }: MailsSearchProps) {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const searchState = useAppSelector(selectMailSearch)

  const [localQuery, setLocalQuery] = useState(searchState.query || '')
  const [inBody, setInBody] = useState(false)
  const [selectedFolders, setSelectedFolders] = useState<string>('')
  const [open, setOpen] = useState(false)

  const handleSearch = useCallback(() => {
    const params: Record<string, string | boolean | undefined> = {
      query: localQuery,
      in_body: inBody || undefined,
      folders: selectedFolders || undefined,
      page: 1,
      per_page: 20,
    }

    dispatch(
      activateSearch({
        query: localQuery,
        searchParams: params,
      })
    )
    setOpen(false)
  }, [localQuery, inBody, selectedFolders, dispatch])

  const handleReset = useCallback(() => {
    setLocalQuery('')
    setInBody(false)
    setSelectedFolders('')
    dispatch(clearSearch())
    setOpen(false)
  }, [dispatch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">
          {searchState.isActive ? (
            <div className="flex items-center gap-2 rounded-md border border-blue-400 bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
              <SearchIcon className="size-4 shrink-0 opacity-70" />
              <span className="truncate max-w-[120px]">
                {searchState.query}
              </span>
              <span className="text-blue-400">
                ({searchState.total})
              </span>
              <X
                className="size-4 cursor-pointer hover:text-blue-900"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReset()
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-gray-500 hover:border-gray-300">
              <SearchIcon className="size-4 shrink-0 opacity-70" />
              {t('search.placeholder.string')}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="absolute z-50 py-2"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <div className="grid gap-4">
          <Input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder.string')}
            autoFocus
          />
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bodySearch">
                {t('search.in_message_content.string')}
              </Label>
              <Checkbox
                id="bodySearch"
                checked={inBody}
                onCheckedChange={(checked) => setInBody(!!checked)}
              />
            </div>
            <div className="">
              <Label>{t('search.folders.string')}</Label>
              <div>
                <Button className="mr-2" variant={'outline'}>
                  {t('search.folders.string')}
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  {t('folders.inbox.string')}
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  {t('folders.drafts.string')}
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  {t('folders.sent.string')}
                </Button>
                <SearchFolders />
              </div>
            </div>
          </div>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline">
                {t('search.more_options.string')}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="scrollbar-thin-gray max-h-[40vh] overflow-y-auto pr-2">
              <SearchMoreOptions />
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-1" />

          <div className="flex items-center justify-end">
            <div>
              <Button variant="outline" onClick={handleReset}>
                {formT('reset.default.string')}
              </Button>
              <Button className="ml-2" onClick={handleSearch}>
                {t('search.confirm.string')}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default memo(MailsSearch, (prev, next) => {
  return Object.is(prev, next) || JSON.stringify(prev) === JSON.stringify(next)
})
