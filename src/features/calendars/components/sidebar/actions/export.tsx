'use client'

import { Button } from '@/components/ui/button'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useJobPolling } from '@/features/jobs'
import { useLazyGetJobResultQuery } from '@/features/jobs/store/jobs-api'
import {
  downloadBlobAsFile,
  filenameFromContentDisposition,
} from '@/features/jobs/utils/download-job-result'
import { Download, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useState } from 'react'
import { useExportCalendarMutation } from '../../../store/calendars-api'

interface ExportActionProps {
  id: string
  name: string
  onClose?: () => void
}

function ExportAction({ id, name, onClose }: ExportActionProps) {
  const t = useTranslations('CALENDARS')
  const [exportCalendar, { isLoading: isExporting }] =
    useExportCalendarMutation()
  const [jobId, setJobId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fetchJobResult] = useLazyGetJobResultQuery()
  const [downloadDone, setDownloadDone] = useState(false)

  const handleSuccess = useCallback(async () => {
    if (!jobId) return
    try {
      const result = await fetchJobResult({
        jobId,
        download: true,
      }).unwrap()
      const filename = filenameFromContentDisposition(
        result.contentDisposition,
        `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`
      )
      downloadBlobAsFile(result.blob, filename)
      setDownloadDone(true)
    } catch {
      setSubmitError(t('sidebar.export.string'))
    }
  }, [fetchJobResult, jobId, name, t])

  const { isPolling, isFailure } = useJobPolling(jobId, {
    onSuccess: handleSuccess,
  })

  const handleExport = async () => {
    setSubmitError(null)
    setDownloadDone(false)
    try {
      const response = await exportCalendar({ key: id }).unwrap()
      setJobId(response.job_id)
    } catch {
      setSubmitError(t('sidebar.export.string'))
    }
  }

  useEffect(() => {
    if (downloadDone) {
      const timer = setTimeout(() => {
        onClose?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [downloadDone, onClose])

  const isProcessing = isExporting || isPolling

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.export.string')}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {submitError && (
          <p className="text-destructive text-sm">{submitError}</p>
        )}

        {downloadDone ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Download className="text-primary h-8 w-8" />
            <p className="text-sm font-medium">{t('sidebar.export.string')}</p>
            <p className="text-muted-foreground text-xs">{name}</p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              <Label>{name}</Label>
            </p>

            {isPolling && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('loading.string')}
              </div>
            )}

            {isFailure && !isPolling && (
              <p className="text-destructive text-sm">
                {t('sidebar.export.string')}
              </p>
            )}

            <Button
              type="button"
              onClick={handleExport}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('sidebar.export.string')}
            </Button>
          </>
        )}
      </div>
    </>
  )
}

export default memo(ExportAction)
