'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useListDonorsQuery, useCreateDonorMutation, useRecordDonationMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Heart, UserPlus, DollarSign } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function DonorManagementPage(): ReactNode {
  const t = useTranslations('DONOR')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [donorType, setDonorType] = useState('individual')
  const [selectedDonor, setSelectedDonor] = useState<string>('')
  const [donateAmount, setDonateAmount] = useState('')
  const [donateCampaign, setDonateCampaign] = useState('general')
  const { data, refetch } = useListDonorsQuery(undefined, { pollingInterval: 15000 })
  const donors = (data as any)?.data ?? []
  const [createDonor, { isLoading: creating }] = useCreateDonorMutation()
  const [recordDonation, { isLoading: donating }] = useRecordDonationMutation()
  const handleCreate = useCallback(async () => {
    if (!email || !name) { toast.error(t('errors.fields.string')); return }
    try { await createDonor({ email, name, donor_type: donorType, gdpr_consent: true }).unwrap(); setEmail(''); setName(''); refetch(); toast.success(t('success.create.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [email, name, donorType, createDonor, refetch, t])
  const handleDonate = useCallback(async () => {
    if (!selectedDonor || !donateAmount) { toast.error(t('errors.fields.string')); return }
    try { await recordDonation({ id: selectedDonor, body: { amount: parseFloat(donateAmount), campaign: donateCampaign } }).unwrap(); setDonateAmount(''); refetch(); toast.success(t('success.donate.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [selectedDonor, donateAmount, donateCampaign, recordDonation, refetch, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Heart className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">{t('register.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={name} onChange={e => setName(e.target.value)} placeholder={t('field.name.string')} /><Input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('field.email.string')} /><select value={donorType} onChange={e => setDonorType(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm"><option value="individual">{t('type.individual.string')}</option><option value="corporate">{t('type.corporate.string')}</option><option value="foundation">{t('type.foundation.string')}</option></select><Button onClick={handleCreate} disabled={creating || !email || !name} className="w-full"><UserPlus className="h-4 w-4 mr-1" /> {t('button.register.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('donate.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><select value={selectedDonor} onChange={e => setSelectedDonor(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm"><option value="">{t('donate.select.string')}</option>{donors.map((d: any) => (<option key={d.id} value={d.id}>{d.name} ({d.email})</option>))}</select><Input type="number" value={donateAmount} onChange={e => setDonateAmount(e.target.value)} placeholder="$100.00" /><Input value={donateCampaign} onChange={e => setDonateCampaign(e.target.value)} placeholder={t('donate.campaign.string')} /><Button onClick={handleDonate} disabled={donating || !selectedDonor || !donateAmount} className="w-full"><DollarSign className="h-4 w-4 mr-1" /> {t('button.donate.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('stats.title.string')}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">{donors.length}</p><p className="text-xs text-muted-foreground">{t('stats.total_donors.string')}</p></div><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">${donors.reduce((s: number, d: any) => s + (d.total_donated ?? 0), 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">{t('stats.total_raised.string')}</p></div></CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">{t('list.title.string')}<Badge variant="outline" className="ml-2">{donors.length}</Badge></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t('field.name.string')}</TableHead><TableHead>{t('field.email.string')}</TableHead><TableHead>{t('field.type.string')}</TableHead><TableHead>{t('field.total.string')}</TableHead><TableHead>{t('field.donations.string')}</TableHead><TableHead>{t('field.consent.string')}</TableHead></TableRow></TableHeader><TableBody>{donors.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t('list.empty.string')}</TableCell></TableRow> : donors.map((d: any) => (<TableRow key={d.id}><TableCell className="font-medium">{d.name}</TableCell><TableCell className="text-sm">{d.email}</TableCell><TableCell><Badge variant="outline" className="capitalize">{d.donor_type}</Badge></TableCell><TableCell className="font-mono">${d.total_donated?.toFixed(2) ?? '0.00'}</TableCell><TableCell>{d.donation_count ?? 0}</TableCell><TableCell>{d.gdpr_consent ? <Badge className="bg-green-600">GDPR</Badge> : <Badge variant="secondary">No</Badge>}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}
