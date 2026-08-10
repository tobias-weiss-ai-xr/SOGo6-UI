'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useExchangeOpenCloudTokenMutation, useBrowseOpenCloudFilesQuery, useSelectOpenCloudFileMutation } from '@/features/mails/store/opencloud-api'
import { useTranslations } from 'next-intl'
import { Folder, File, FileText, Image, ChevronRight, ChevronLeft, Upload, Link, Loader2 } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'folder': return <Folder className="h-4 w-4 text-yellow-600" />
    case 'pdf': return <FileText className="h-4 w-4 text-red-600" />
    case 'image': return <Image className="h-4 w-4 text-blue-600" />
    default: return <File className="h-4 w-4 text-muted-foreground" />
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
  onSelect: (file: { file_path: string; share_url: string; action: string }) => void
  onClose: () => void
}

export function OpenCloudPicker({ onSelect, onClose }: OpenCloudPickerProps): ReactNode {
  const t = useTranslations('OPENCLOUD')
  const [currentPath, setCurrentPath] = useState('/')
  const [search, setSearch] = useState('')

  const [exchangeToken, { data: tokenData }] = useExchangeOpenCloudTokenMutation()
  const { data: browseData, isLoading: browseLoading } = useBrowseOpenCloudFilesQuery(
    { token: tokenData?.access_token ?? '', path: currentPath },
    { skip: !tokenData?.access_token }
  )
  const [selectFile, { isLoading: selecting }] = useSelectOpenCloudFileMutation()

  const files: FileItem[] = browseData?.files ?? []

  const handleRefresh = useCallback(() => {
    exchangeToken({ scopes: ['files.read', 'files.write'] })
  }, [exchangeToken])

  const handleNavigate = useCallback((folder: string) => {
    const newPath = currentPath === '/' ? `/${folder}` : `${currentPath}/${folder}`
    setCurrentPath(newPath)
  }, [currentPath])

  const handleBack = useCallback(() => {
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    setCurrentPath(parts.length === 0 ? '/' : `/${parts.join('/')}`)
  }, [currentPath])

  const handlePick = useCallback(async (file: FileItem) => {
    if (file.type === 'folder') {
      handleNavigate(file.name)
      return
    }
    try {
      const result = await selectFile({
        token: tokenData?.access_token ?? '',
        file_path: currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`,
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
  }, [tokenData, currentPath, selectFile, onSelect, t])

  const filteredFiles = search
    ? files.filter((f: FileItem) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files

  const folders = filteredFiles.filter((f: FileItem) => f.type === 'folder')
  const nonFolders = filteredFiles.filter((f: FileItem) => f.type !== 'folder')

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Button variant="ghost" size="sm" onClick={handleBack} disabled={currentPath === '/'}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-sm font-mono text-muted-foreground truncate">
          {currentPath}
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <Loader2 className={`h-4 w-4 ${browseLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search */}
      <div className="p-2 border-b">
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
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              {t('picker.empty.string')}
            </div>
          ) : (
            <>
              {folders.map((file: FileItem) => (
                <button
                  key={file.name}
                  onClick={() => handleNavigate(file.name)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left text-sm"
                >
                  <FileIcon type="folder" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
              {nonFolders.map((file: FileItem) => (
                <button
                  key={file.name}
                  onClick={() => handlePick(file)}
                  disabled={selecting}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left text-sm"
                >
                  <FileIcon type={guessType(file.name)} />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)}K</span>
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
