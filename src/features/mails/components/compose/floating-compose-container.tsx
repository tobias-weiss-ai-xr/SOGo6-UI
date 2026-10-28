'use client'

import { usePathname } from '@/lib/i18n/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectOpenDraftIds } from '../../store'
import FloatingCompose from './floating-compose'

const FloatingComposeContainer = () => {
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  // The classic full-page composer (/compose) renders its own copy of the
  // draft; showing the floating window on top would double-draw it.
  const pathname = usePathname()
  const isFullPageCompose = pathname.endsWith('/compose')

  if (openDraftIds.length === 0 || isFullPageCompose) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-14 bottom-0 z-100 flex flex-row-reverse items-end -space-x-32 space-x-reverse px-4">
      {openDraftIds.map((draftId) => (
        <FloatingCompose key={draftId} draftId={draftId} />
      ))}
    </div>
  )
}

export default FloatingComposeContainer
