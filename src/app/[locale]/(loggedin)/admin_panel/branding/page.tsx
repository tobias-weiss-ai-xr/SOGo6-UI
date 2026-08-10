'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetDomainsQuery, useGetDomainBrandingQuery, useSetDomainBrandingMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Palette, Save, Upload, X } from 'lucide-react'
import React, { ReactNode, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function BrandingPage(): ReactNode {
  const t = useTranslations('AP_BRANDING')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [primaryColor, setPrimaryColor] = useState('')
  const [customCss, setCustomCss] = useState('')
  const [loginHeader, setLoginHeader] = useState('')
  const [loginFooter, setLoginFooter] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoB64, setLogoB64] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [faviconB64, setFaviconB64] = useState<string | null>(null)

  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)

  const { data: domains = [], isLoading: domainsLoading } = useGetDomainsQuery()
  const { data: branding, isLoading: brandingLoading } = useGetDomainBrandingQuery(selectedDomain, { skip: !selectedDomain })
  const [setBranding] = useSetDomainBrandingMutation()

  // Populate fields when branding loads
  React.useEffect(() => {
    if (branding) {
      setPrimaryColor(branding.primary_color ?? '')
      setCustomCss(branding.custom_css ?? '')
      setLoginHeader(branding.login_header ?? '')
      setLoginFooter(branding.login_footer ?? '')
      setLogoPreview(branding.logo ?? null)
      setLogoB64(branding.logo ?? null)
      setFaviconPreview(branding.favicon ?? null)
      setFaviconB64(branding.favicon ?? null)
    }
  }, [branding])

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await fileToBase64(file)
      setLogoB64(b64)
      setLogoPreview(b64)
    } catch { toast.error(t('errors.upload.string')) }
  }, [t])

  const handleFaviconUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await fileToBase64(file)
      setFaviconB64(b64)
      setFaviconPreview(b64)
    } catch { toast.error(t('errors.upload.string')) }
  }, [t])

  const handleSave = useCallback(async () => {
    if (!selectedDomain) return
    try {
      await setBranding({
        domain: selectedDomain,
        primary_color: primaryColor || null,
        custom_css: customCss || null,
        login_header: loginHeader || null,
        login_footer: loginFooter || null,
        logo: logoB64 || null,
        favicon: faviconB64 || null,
      }).unwrap()
      toast.success(t('save.success.string'))
    } catch {
      toast.error(t('save.error.string'))
    }
  }, [selectedDomain, primaryColor, customCss, loginHeader, loginFooter, logoB64, faviconB64, setBranding, t])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>

      {/* Domain selector */}
      <div className="mb-6 max-w-md">
        <Label>{t('select_domain.string')}</Label>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm mt-1"
        >
          <option value="">{t('select_placeholder.string')}</option>
          {domains.map((d: any) => (
            <option key={d.domain_id || d.domain} value={d.domain_id || d.domain}>
              {d.domain_id || d.domain}
            </option>
          ))}
        </select>
      </div>

      {!selectedDomain && (
        <div className="text-muted-foreground text-sm">{t('select_hint.string')}</div>
      )}

      {brandingLoading && <Skeleton className="h-40" />}

      {selectedDomain && !brandingLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Visual identity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" /> {t('card.identity.string')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo upload */}
              <div className="space-y-2">
                <Label>{t('labels.logo.string')}</Label>
                <input ref={logoRef} type="file" accept="image/png,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <div className="relative h-12 w-32 border rounded-md overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                      <button onClick={() => { setLogoPreview(null); setLogoB64(null) }} className="absolute top-0 right-0 p-0.5 bg-destructive text-destructive-foreground rounded-bl-md">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> {t('buttons.upload.string')}
                  </Button>
                </div>
              </div>

              {/* Favicon upload */}
              <div className="space-y-2">
                <Label>{t('labels.favicon.string')}</Label>
                <input ref={faviconRef} type="file" accept="image/x-icon,image/png" onChange={handleFaviconUpload} className="hidden" />
                <div className="flex items-center gap-3">
                  {faviconPreview ? (
                    <div className="relative h-8 w-8 border rounded-md overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={faviconPreview} alt="Favicon" className="h-full w-full object-contain" />
                      <button onClick={() => { setFaviconPreview(null); setFaviconB64(null) }} className="absolute top-0 right-0 p-0 bg-destructive text-destructive-foreground rounded-bl-md">
                        <X className="h-2 w-2" />
                      </button>
                    </div>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => faviconRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> {t('buttons.upload.string')}
                  </Button>
                </div>
              </div>

              {/* Primary color */}
              <div className="space-y-2">
                <Label>{t('labels.primary_color.string')}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor || '#3B82F6'}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 rounded cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#3B82F6"
                    className="max-w-[200px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login page text + CSS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('card.login_page.string')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('labels.login_header.string')}</Label>
                <Input value={loginHeader} onChange={(e) => setLoginHeader(e.target.value)} placeholder={t('placeholders.header.string')} />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.login_footer.string')}</Label>
                <Input value={loginFooter} onChange={(e) => setLoginFooter(e.target.value)} placeholder={t('placeholders.footer.string')} />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.custom_css.string')}</Label>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  rows={6}
                  placeholder={t('placeholders.css.string')}
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedDomain && (
        <div className="mt-6">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> {t('save.button.string')}
          </Button>
        </div>
      )}
    </div>
  )
}
