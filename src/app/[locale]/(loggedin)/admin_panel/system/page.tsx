'use client'

import { useGetSystemQuery, usePatchSystemMutation } from '@/features/admin-panel/store/admin-panel-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

/**
 * Default values used when the API returns null/empty data.
 */
const DEFAULT_SYSTEM_SETTINGS: Record<string, unknown> = {
  SOGO_S_DIRECT_LOGIN: false,
  SOGO_S_DOMAINLESS_LOGIN: false,
  SOGO_S_DO_DOMAIN: false,
  SOGO_S_REJECT_UNKNOWN_DOMAIN: false,
  SOGO_S_SENDMAIL: '/usr/lib/sendmail',
}

/**
 * Describes a single system setting field.
 */
interface SystemFieldDef {
  /** The setting key (e.g. "SOGO_S_DO_DOMAIN") */
  key: string
  /** The data type — "bool" renders a switch, "str" renders a text input */
  type: 'bool' | 'str'
}

/** Ordered list of system settings to display in the form. */
const SYSTEM_FIELDS: SystemFieldDef[] = [
  { key: 'SOGO_S_DIRECT_LOGIN', type: 'bool' },
  { key: 'SOGO_S_DOMAINLESS_LOGIN', type: 'bool' },
  { key: 'SOGO_S_DO_DOMAIN', type: 'bool' },
  { key: 'SOGO_S_REJECT_UNKNOWN_DOMAIN', type: 'bool' },
  { key: 'SOGO_S_SENDMAIL', type: 'str' },
]

export default function SystemSettingsPage(): ReactNode {
  const t = useTranslations('AP_SYSTEM')
  const router = useRouter()

  const { data: systemData, isLoading, isError, error } = useGetSystemQuery()
  const [patchSystem, { isLoading: isSaving }] = usePatchSystemMutation()

  // Local form state — initialised from API data once loaded
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Populate form when data arrives
  useEffect(() => {
    if (systemData) {
      const settings = (systemData as Record<string, any>)?.SYSTEM_SETTINGS ?? {}
      setFormValues({ ...DEFAULT_SYSTEM_SETTINGS, ...settings })
    }
  }, [systemData])

  // Track changes
  useEffect(() => {
    if (!systemData) return
    const current = (systemData as Record<string, any>)?.SYSTEM_SETTINGS ?? {}
    const changed = SYSTEM_FIELDS.some(
      (field) => formValues[field.key] !== current[field.key]
    )
    setHasChanges(changed)
  }, [formValues, systemData])

  /** Update a single field value. */
  const updateField = useCallback(
    (key: string, value: unknown) => {
      setFormValues((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  /** Save changes to the backend. */
  const handleSave = useCallback(async () => {
    try {
      // Only send SYSTEM_SETTINGS section
      await patchSystem({
        config: { SYSTEM_SETTINGS: formValues },
      }).unwrap()
      toast.success(t('saved.string'))
      setHasChanges(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { data?: { message?: string } })?.data?.message ??
            String(err)
      toast.error(t('save_error.string', { message }))
    }
  }, [formValues, patchSystem, t])

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="mb-2 text-xl font-semibold text-destructive">
          {t('load_error.string')}
        </h2>
        <p className="mb-4 text-muted-foreground">
          {error instanceof Error
            ? error.message
            : String((error as { status?: number })?.status ?? '')}
        </p>
        <Button variant="outline" onClick={() => router.refresh()}>
          {t('retry.string')}
        </Button>
      </div>
    )
  }

  // ── Render form ──
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('title.string')}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('description.string')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('form_title.string')}</CardTitle>
          <CardDescription>
            {t('form_description.string')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {SYSTEM_FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <Label className="text-base">
                  {t(`fields.${field.key}.label.string`)}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t(`fields.${field.key}.description.string`)}
                </p>
              </div>

              {field.type === 'bool' ? (
                <Switch
                  checked={Boolean(formValues[field.key])}
                  onCheckedChange={(checked) => updateField(field.key, checked)}
                  aria-label={t(`fields.${field.key}.label.string`)}
                />
              ) : (
                <Input
                  className="w-64"
                  value={String(formValues[field.key] ?? '')}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  aria-label={t(`fields.${field.key}.label.string`)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? t('saving.string') : t('save.string')}
        </Button>
        {hasChanges && (
          <p className="text-sm text-muted-foreground">
            {t('unsaved_changes.string')}
          </p>
        )}
      </div>
    </div>
  )
}
