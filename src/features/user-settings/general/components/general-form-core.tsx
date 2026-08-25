'use client'
import { Checkbox } from '@/components/ui/checkbox'
import { TimezoneSelect } from '@/components/ui/dates/timezones'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import SelectForm from '@/components/ui/forms/select-form'
import type { UserGeneral } from '@/features/user-settings/store/user-preferences-api-types'
import { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import {
  DateFormats,
  MODULES,
  TIMEFORMAT,
} from '@/features/user-settings/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  mapApiToGeneralSettings,
  mapGeneralSettingsToApi,
} from '../store/general-utils'
import { schema } from './general-schema'
import { logger } from '@/lib/logger'
import { usePathname, useRouter } from '@/lib/i18n/navigation'

// Native language names for the selector
const LANGUAGE_OPTIONS = [
  { value: 'en', labelKey: 'language.english' },
  { value: 'de', labelKey: 'language.german' },
  { value: 'fr', labelKey: 'language.french' },
  { value: 'es', labelKey: 'language.spanish' },
  { value: 'zh', labelKey: 'language.chinese' },
  { value: 'it', labelKey: 'language.italian' },
  { value: 'pt', labelKey: 'language.portuguese' },
  { value: 'nl', labelKey: 'language.dutch' },
  { value: 'pl', labelKey: 'language.polish' },
  { value: 'ru', labelKey: 'language.russian' },
  { value: 'sv', labelKey: 'language.swedish' },
  { value: 'da', labelKey: 'language.danish' },
  { value: 'fi', labelKey: 'language.finnish' },
  { value: 'no', labelKey: 'language.norwegian' },
  { value: 'cs', labelKey: 'language.czech' },
  { value: 'el', labelKey: 'language.greek' },
  { value: 'tr', labelKey: 'language.turkish' },
  { value: 'hu', labelKey: 'language.hungarian' },
  { value: 'ro', labelKey: 'language.romanian' },
  { value: 'ja', labelKey: 'language.japanese' },
  { value: 'hi', labelKey: 'language.hindi' },
  { value: 'ar', labelKey: 'language.arabic' },
  { value: 'ko', labelKey: 'language.korean' },
  { value: 'th', labelKey: 'language.thai' },
  { value: 'vi', labelKey: 'language.vietnamese' },
  { value: 'id', labelKey: 'language.indonesian' },
]

interface Props {
  data: UserPreferences | undefined
  update: (data: UserGeneral) => void
}

export function GeneralSettingsForm({ data, update }: Props) {
  const t = useTranslations('US_GENERAL')
  const t_common = useTranslations('COMMON')
  const locale = useLocale()
  const { push } = useRouter()
  const pathname = usePathname()

  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year_short = String(today.getFullYear()).slice(-2)
  const month_short = today.toLocaleString('en', { month: 'short' })

  const dayName = today.toLocaleString('en', { weekday: 'long' })
  const month_long = today.toLocaleString('en', { month: 'long' })
  const year = today.getFullYear()

  const fetchedData = data ? mapApiToGeneralSettings(data) : undefined

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: fetchedData,
  })

  useEffect(() => {
    if (data) {
      form.reset(mapApiToGeneralSettings(data))
    }
  }, [data])

  function onSubmit(values: z.infer<typeof schema>) {
    update(mapGeneralSettingsToApi(values))
  }

  // When the user changes the language in the selector, save the
  // preference AND immediately switch the UI locale via next-intl
  // navigation. This updates the URL to /<locale>/... and reloads
  // the page with the new language.
  function handleLanguageChange(newLocale: string) {
    // Update the form value
    form.setValue('language', newLocale, { shouldDirty: true })
    // Persist the preference to the backend
    const currentValues = form.getValues()
    update(mapGeneralSettingsToApi(currentValues))
    // Switch the UI locale immediately
    push(pathname, { locale: newLocale })
  }

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (err) => {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('form validation errors', { detail: err })
          }
        })}
      >
        <div className="grid gap-4 space-y-5">
          <div className="grid grid-cols-2 gap-4 space-x-10">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.language.string')}</FormLabel>
                  <SelectForm
                    onValueChange={(v) => handleLanguageChange(v)}
                    value={field.value ?? locale ?? 'en'}
                    options={LANGUAGE_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: t_common(opt.labelKey),
                    }))}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.language.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.timezone.string')}</FormLabel>
                  <TimezoneSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-70"
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.timezone.string')}
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.timezone.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: 'Europe/Paris', label: 'Europe/Paris' },
                      { value: 'America/New_York', label: 'America/New_York' },
                    ]}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.timezone.string')}
                  </FormDescription>
                </FormItem>
              )}
            /> */}
          </div>
          <div className="grid gap-4 lg:grid-cols-3 lg:space-x-10">
            <FormField
              control={form.control}
              name="shortDateStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.short_date_style.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      {
                        value: DateFormats.DD_MMM_YY,
                        label: `${day}-${month_short}-${year_short}`,
                      },
                      {
                        value: DateFormats.MM_DD_YY,
                        label: `${month}/${year}/${year}`,
                      },
                      {
                        value: DateFormats.DD_MM_YY,
                        label: `${day}/${month}/${year}`,
                      },
                    ]}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.short_date_style.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longDateStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.long_date_style.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      {
                        value: DateFormats.FULL_LONG_US,
                        label: `${dayName}, ${month_long} ${day}, ${year}`,
                      },
                      {
                        value: DateFormats.FULL_LONG_EU,
                        label: `${dayName}, ${day} ${month_long} ${year}`,
                      },
                      {
                        value: DateFormats.MMM_DD_YYYY,
                        label: `${month_long} ${day}, ${year}`,
                      },
                    ]}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.long_date_style.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.time_style.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      {
                        value: TIMEFORMAT.HOUR_PM,
                        label: '3:02 PM',
                      },
                      {
                        value: TIMEFORMAT.HOUR,
                        label: '15:02',
                      },
                      {
                        value: TIMEFORMAT.HOUR_SECONDS,
                        label: '15:02:00',
                      },
                    ]}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.time_style.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 space-x-10">
            <FormField
              control={form.control}
              name="defaultView"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.default_view.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: MODULES.MAIL, label: t('labels.mail.string') },
                      {
                        value: MODULES.CALENDAR,
                        label: t('labels.calendar.string'),
                      },
                      {
                        value: MODULES.CONTACTS,
                        label: t('labels.contacts.string'),
                      },
                      { value: MODULES.LAST, label: t('labels.last.string') },
                    ]}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.default_view.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 space-x-10">
            <FormField
              control={form.control}
              name="enableNotifications"
              render={({ field }) => (
                <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="min-w-0 flex-1">
                    <FormLabel className="mb-2 block wrap-break-word">
                      {t('labels.enable_notifications.string')}
                    </FormLabel>
                    <FormMessage />
                    <FormDescription className="wrap-break-word">
                      {t('descriptions.enable_notifications.string')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarEnabled"
              render={({ field }) => (
                <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="min-w-0 flex-1">
                    <FormLabel className="mb-2 block wrap-break-word">
                      {t('labels.enable_external_avatar.string')}
                    </FormLabel>
                    <FormMessage />
                    <FormDescription className="wrap-break-word">
                      {t('descriptions.enable_external_avatar.string')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="mt-6">
          <FixedFormButtonGroup
            onReset={form.reset}
            disableReset={!isDirty || isSubmitting}
            disableSubmit={!isDirty || isSubmitting}
          />
        </div>
      </form>
    </Form>
  )
}

export default GeneralSettingsForm
