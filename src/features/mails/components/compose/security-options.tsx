'use client'

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import type { MailComposeDraft } from '../../store/mail-compose-slice'
import {
  toggleEncryptMessage,
  toggleSignMessage,
} from '../../store/mail-compose-slice'

interface SecurityOptionsProps {
  draftId: string
  signMessage?: boolean
  encryptMessage?: boolean
}

export function SecurityOptions({
  draftId,
  signMessage,
  encryptMessage,
}: SecurityOptionsProps) {
  const t = useTranslations('COMPOSE')
  const dispatch = useAppDispatch()

  return (
    <DropdownMenuGroup>
      <DropdownMenuCheckboxItem
        checked={signMessage}
        onCheckedChange={() => dispatch(toggleSignMessage({ draftId }))}
      >
        {t('sign_message.string')}
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={encryptMessage}
        onCheckedChange={() => dispatch(toggleEncryptMessage({ draftId }))}
      >
        {t('encrypt_message.string')}
      </DropdownMenuCheckboxItem>
    </DropdownMenuGroup>
  )
}
