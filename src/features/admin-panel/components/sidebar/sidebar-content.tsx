import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Link } from '@/lib/i18n/navigation'
import { NavItems } from '@/types'
import { useTranslations } from 'next-intl'
import CollapsedNavMenu from './collapsed-sidebar'
import items from './content'

interface RecursiveNavItemProps {
  item: NavItems
}

function NavLink({
  item,
  children,
}: {
  item: NavItems
  children: React.ReactNode
}) {
  if (item.target) {
    return (
      <a href={item.url} target={item.target} rel={item.rel ?? 'noreferrer'}>
        {children}
      </a>
    )
  }
  return <Link href={item.url!}>{children}</Link>
}

function RecursiveNavItem({ item }: RecursiveNavItemProps) {
  const t = useTranslations()
  if (item.items) {
    return (
      <SidebarMenuItem className="group/collapsible">
        <SidebarMenuButton tooltip={t(item.title)}>
          {item.icon && <item.icon />}
          <span>{t(item.title)}</span>
        </SidebarMenuButton>
        <SidebarMenuSub className="border-none">
          {item.items?.map((subItem) =>
            subItem.url ? (
              <SidebarMenuSubItem className="pt-2" key={subItem.title}>
                <NavLink item={subItem}>
                  <SidebarMenuButton>
                    {subItem.icon && <subItem.icon size={24} />}
                    <span>{t(subItem.title)}</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuSubItem>
            ) : (
              <RecursiveNavItem key={subItem.title} item={subItem} />
            )
          )}
        </SidebarMenuSub>
      </SidebarMenuItem>
    )
  } else if (item.url) {
    return (
      <SidebarMenuItem key={item.title}>
        <NavLink item={item}>
          <SidebarMenuButton tooltip={t(item.title)}>
            {item.icon && <item.icon />}
            <span>{t(item.title)}</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    )
  } else {
    // No URL and no children — render a plain (non-link) item
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton tooltip={t(item.title)}>
          {item.icon && <item.icon />}
          <span>{t(item.title)}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
}

export function Sidebar() {
  return (
    <div>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {items.map((item) => (
            <RecursiveNavItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenu>
          <CollapsedNavMenu items={items} />
        </SidebarMenu>
      </SidebarGroup>
    </div>
  )
}

export default Sidebar
