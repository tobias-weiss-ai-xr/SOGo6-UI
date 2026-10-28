'use client'

import { Button } from '@/components/ui/button'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useJobPolling } from '@/features/jobs'
import { CheckCircle2, FileUp, Loader2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef, useState } from 'react'
import { useImportCalendarMutation } from '../../../store/calendars-api'

interface ImportActionProps {
  id: string
  name: string
  onClose?: () => void
}

function ImportAction({ id, name, onClose }: ImportActionProps) {
  const t = useTranslations('CALENDARS')
  const [importCalendar, { isLoading: isUploading }] =
    useImportCalendarMutation()
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { isPolling, isFailure } = useJobPolling(jobId, {
    onSuccess: () => setDone(true),
  })

  const handleImport = async () => {
    if (!file) return
    setSubmitError(null)
    setDone(false)
    try {
      const response = await importCalendar({ key: id, file }).unwrap()
      setJobId(response.job_id)
    } catch {
      setSubmitError(t('sidebar.import.string'))
    }
  }

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        onClose?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [done, onClose])

  const isProcessing = isUploading || isPolling

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.import.string')}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {submitError && (
          <p className="text-destructive text-sm">{submitError}</p>
        )}

        {done ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="text-primary h-8 w-8" />
            <p className="text-sm font-medium">
              {t('sidebar.import.success.string')}
            </p>
            <p className="text-muted-foreground text-xs">{name}</p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              {t('sidebar.import.description.string')}
              <span className="text-foreground block font-medium">{name}</span>
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".ics,text/calendar,application/ics"
              className="hidden"
              data-testid="calendar-import-input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full"
            >
              <FileUp className="mr-2 h-4 w-4" />
              {file ? file.name : t('sidebar.import.choose_file.string')}
            </Button>

            {isPolling && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('loading.string')}
              </div>
            )}

            {isFailure && !isPolling && (
              <p className="text-destructive text-sm">
                {t('sidebar.import.string')}
              </p>
            )}

            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="w-full"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!isProcessing && <Upload className="mr-2 h-4 w-4" />}
              {t('sidebar.import.string')}
            </Button>
          </>
        )}
      </div>
    </>
  )
}

export default memo(ImportAction)
