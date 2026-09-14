import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

import Image from 'next/image'
import React from 'react'
import SidebarsContent from './app-sidebar-content'
import { AppSidebarMobileEffects } from './app-sidebar-mobile-effects'

export function AppSidebar(): React.JSX.Element {
  const { open } = useSidebar()
  return (
    <Sidebar collapsible="icon">
      <AppSidebarMobileEffects />
      <SidebarHeader className="flex rounded-br-2xl px-2 pt-3" />
      <SidebarContent
        className="scrollbar-thin-gray mt-1 overflow-y-auto p-0 pt-1 [scrollbar-gutter:auto]! group-data-[state=collapsed]:overflow-visible"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
          scrollbarGutter: 'stable',
        }}
      >
        <SidebarsContent />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border bg-sidebar z-10 flex items-center justify-between border-t p-2">
        {open && (
          <Image
            alt="App Logo"
            src="/images/sogo-full-alt.png"
            width={72}
            height={36}
            className="ml-2 shrink-0"
          />
        )}
        <SidebarTrigger className="h-10 w-15 rounded-r-none" />
      </SidebarFooter>
    </Sidebar>
  )
}
