'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useBrowseOpenCloudFilesQuery,
  useExchangeOpenCloudTokenMutation,
  useSelectOpenCloudFileMutation,
} from '@/features/mails/store/opencloud-api'
import {
  ChevronLeft,
  ChevronRight,
  File,
  FileText,
  Folder,
  ImageIcon,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ReactNode, useCallback, useState } from 'react'
import { toast } from 'sonner'

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'folder':
      return <Folder className="h-4 w-4 text-yellow-600" aria-hidden="true" />
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-600" aria-hidden="true" />
    case 'image':
      return <ImageIcon className="h-4 w-4 text-blue-600" aria-hidden="true" />
    default:
      return (
        <File className="text-muted-foreground h-4 w-4" aria-hidden="true" />
      )
  }
}

function guessType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
  return 'file'
}

interface FileItem {
  name: string
  type: 'folder' | 'file'
  size: number
  modified: string | number
}

interface OpenCloudPickerProps {
  onSelect: (file: {
    file_path: string
    share_url: string
    action: string
  }) => void
  accessToken?: string
}

export function OpenCloudPicker({
  onSelect,
  accessToken: externalToken,
}: OpenCloudPickerProps): ReactNode {
  const t = useTranslations('OPENCLOUD')
  const [currentPath, setCurrentPath] = useState('/')
  const [search, setSearch] = useState('')

  const [exchangeToken, { data: tokenData }] =
    useExchangeOpenCloudTokenMutation()
  const { data: browseData, isLoading: browseLoading } =
    useBrowseOpenCloudFilesQuery(
      {
        token: externalToken ? externalToken : (tokenData?.access_token ?? ''),
        path: currentPath,
      },
      { skip: !externalToken && !tokenData?.access_token }
    )
  const [selectFile, { isLoading: selecting }] =
    useSelectOpenCloudFileMutation()

  const files: FileItem[] = browseData?.files ?? []

  const handleRefresh = useCallback(() => {
    if (!externalToken) {
      exchangeToken({ scopes: ['files.read', 'files.write'] })
    }
  }, [exchangeToken, externalToken])

  const handleNavigate = useCallback(
    (folder: string) => {
      const newPath =
        currentPath === '/' ? `/${folder}` : `${currentPath}/${folder}`
      setCurrentPath(newPath)
    },
    [currentPath]
  )

  const handleBack = useCallback(() => {
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    setCurrentPath(parts.length === 0 ? '/' : `/${parts.join('/')}`)
  }, [currentPath])

  const handlePick = useCallback(
    async (file: FileItem) => {
      if (file.type === 'folder') {
        handleNavigate(file.name)
        return
      }
      try {
        const result = await selectFile({
          token: externalToken
            ? externalToken
            : (tokenData?.access_token ?? ''),
          file_path:
            currentPath === '/'
              ? `/${file.name}`
              : `${currentPath}/${file.name}`,
          action: 'attach',
        }).unwrap()
        onSelect({
          file_path: result.file_path,
          share_url: result.share_url,
          action: result.action,
        })
        toast.success(t('picker.attached.string', { name: file.name }))
      } catch {
        toast.error(t('picker.error.string'))
      }
    },
    [
      externalToken,
      tokenData,
      currentPath,
      selectFile,
      onSelect,
      t,
      handleNavigate,
    ]
  )

  const filteredFiles = search
    ? files.filter((f: FileItem) =>
        f.name.toLowerCase().includes(search.toLowerCase())
      )
    : files

  const folders = filteredFiles.filter((f: FileItem) => f.type === 'folder')
  const nonFolders = filteredFiles.filter((f: FileItem) => f.type !== 'folder')

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={currentPath === '/'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-muted-foreground flex-1 truncate font-mono text-sm">
          {currentPath}
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <Loader2
            className={`h-4 w-4 ${browseLoading ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {/* Search */}
      <div className="border-b p-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('picker.search.string')}
          className="h-8 text-xs"
        />
      </div>

      {/* Files */}
      <ScrollArea className="flex-1">
        <div className="p-1">
          {browseLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-xs">
              {t('picker.empty.string')}
            </div>
          ) : (
            <>
              {folders.map((file: FileItem) => (
                <button
                  key={file.name}
                  onClick={() => handleNavigate(file.name)}
                  className="hover:bg-muted flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                >
                  <FileIcon type="folder" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <ChevronRight className="text-muted-foreground h-3 w-3" />
                </button>
              ))}
              {nonFolders.map((file: FileItem) => (
                <button
                  key={file.name}
                  onClick={() => handlePick(file)}
                  disabled={selecting}
                  className="hover:bg-muted flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                >
                  <FileIcon type={guessType(file.name)} />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {(file.size / 1024).toFixed(0)}
                    {t('picker.kb.string')}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default OpenCloudPicker
