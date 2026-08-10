'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { ExternalLink, LayoutDashboard, Settings, Cloud } from 'lucide-react'
import React, { ReactNode, useEffect, useState } from 'react'

interface PortalApp {
  app_id: string
  name: string
  description: string
  icon_url?: string
  launch_url: string
  scopes: string[]
  category: string
}

const INTEGRATION_APPS: PortalApp[] = [
  {
    app_id: 'sogo6',
    name: 'SOGo 6 Groupware',
    description: 'Email, calendar, contacts, and tasks',
    launch_url: '',
    scopes: ['openid', 'profile', 'email'],
    category: 'productivity',
  },
]

export default function PortalPage(): ReactNode {
  const t = useTranslations('PORTAL')
  const [portalConfig, setPortalConfig] = useState<PortalApp[] | null>(null)
  const [intercomStatus, setIntercomStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    // Fetch portal config from nubusintercom
    fetch('/api/user/v1/opencloud/token/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scopes: ['files.read'], timestamp: Math.floor(Date.now() / 1000) }) })
      .then(res => {
        if (res.ok) setIntercomStatus('connected')
        else setIntercomStatus('disconnected')
      })
      .catch(() => setIntercomStatus('disconnected'))

    fetch('http://localhost:8100/api/v1/portal/config')
      .then(res => res.json())
      .then(data => setPortalConfig([data]))
      .catch(() => setPortalConfig(null))
  }, [])

  const apps = portalConfig ?? INTEGRATION_APPS

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={intercomStatus === 'connected' ? 'default' : 'destructive'} className={intercomStatus === 'connected' ? 'bg-green-600' : ''}>
            <Cloud className="h-3 w-3 mr-1" />
            nubusintercom: {intercomStatus}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin_panel/webhooks" target="_blank">
              <Settings className="h-4 w-4 mr-1" /> {t('settings.string')}
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.map(app => (
          <Card key={app.app_id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                {app.name}
                <Badge variant="outline" className="text-xs ml-auto">{app.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {app.scopes.slice(0, 4).map(s => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
                {app.scopes.length > 4 && <Badge variant="secondary" className="text-xs">+{app.scopes.length - 4}</Badge>}
              </div>
              <Button size="sm" asChild>
                <a href={app.launch_url || '/'} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> {t('launch.string')}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
