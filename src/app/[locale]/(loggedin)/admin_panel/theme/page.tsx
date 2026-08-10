'use client'

import { useGetThemeQuery, usePatchThemeMutation } from '@/features/admin-panel/store/admin-panel-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

/**
 * Default theme values.
 */
const DEFAULT_THEME: Record<string, string> = {
  primary: '180 25% 40%',
  primary_foreground: '0 0% 100%',
  background: '0 0% 100%',
  foreground: '240 5% 10%',
  sidebar_background: '180 25% 40%',
  sidebar_foreground: '0 0% 100%',
  sidebar_primary: '180 60% 45%',
  sidebar_accent: '180 25% 60%',
  header_background: '0 0% 100%',
  header_foreground: '270 60% 60%',
  logo_url: '',
  custom_css: '',
}

/**
 * Ordered list of theme fields with labels.
 */
const THEME_FIELDS: { key: string; labelKey: string; type: 'color' | 'text' | 'textarea' }[] = [
  { key: 'primary', labelKey: 'primary', type: 'color' },
  { key: 'primary_foreground', labelKey: 'primary_foreground', type: 'color' },
  { key: 'background', labelKey: 'background', type: 'color' },
  { key: 'foreground', labelKey: 'foreground', type: 'color' },
  { key: 'sidebar_background', labelKey: 'sidebar_background', type: 'color' },
  { key: 'sidebar_foreground', labelKey: 'sidebar_foreground', type: 'color' },
  { key: 'sidebar_primary', labelKey: 'sidebar_primary', type: 'color' },
  { key: 'sidebar_accent', labelKey: 'sidebar_accent', type: 'color' },
  { key: 'header_background', labelKey: 'header_background', type: 'color' },
  { key: 'header_foreground', labelKey: 'header_foreground', type: 'color' },
  { key: 'logo_url', labelKey: 'logo_url', type: 'text' },
  { key: 'custom_css', labelKey: 'custom_css', type: 'textarea' },
]

export default function ThemeSettingsPage(): ReactNode {
  const t = useTranslations('AP_THEME')
  const router = useRouter()

  const { data: themeData, isLoading, isError, error } = useGetThemeQuery()
  const [patchTheme, { isLoading: isSaving }] = usePatchThemeMutation()

  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Populate form when data arrives
  useEffect(() => {
    if (themeData) {
      setFormValues({ ...DEFAULT_THEME, ...(themeData as Record<string, any>)?.data ?? {} })
    }
  }, [themeData])

  // Track changes
  useEffect(() => {
    if (!themeData) return
    const current = (themeData as Record<string, any>)?.data ?? {}
    const changed = THEME_FIELDS.some(
      (field) => formValues[field.key] !== current[field.key]
    )
    setHasChanges(changed)
  }, [formValues, themeData])

  const updateField = useCallback(
    (key: string, value: string) => {
      setFormValues((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleSave = useCallback(async () => {
    try {
      await patchTheme({ config: formValues }).unwrap()
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
  }, [formValues, patchTheme, t])

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
          {THEME_FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <Label className="text-base">
                  {t(`fields.${field.labelKey}.label.string`)}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t(`fields.${field.labelKey}.description.string`)}
                </p>
              </div>

              {field.type === 'color' ? (
                <div className="flex items-center gap-2">
                  {/* Color preview swatch */}
                  <div
                    className="h-8 w-8 rounded-full border"
                    style={{
                      background: formValues[field.key]
                        ? `hsl(${formValues[field.key]})`
                        : 'transparent',
                    }}
                  />
                  <Input
                    className="w-48 font-mono text-sm"
                    value={String(formValues[field.key] ?? '')}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder="e.g. 180 25% 40%"
                    aria-label={t(`fields.${field.labelKey}.label.string`)}
                  />
                </div>
              ) : field.type === 'textarea' ? (
                <Textarea
                  className="w-full max-w-md font-mono text-sm"
                  rows={4}
                  value={String(formValues[field.key] ?? '')}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  aria-label={t(`fields.${field.labelKey}.label.string`)}
                />
              ) : (
                <Input
                  className="w-64"
                  value={String(formValues[field.key] ?? '')}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  aria-label={t(`fields.${field.labelKey}.label.string`)}
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
