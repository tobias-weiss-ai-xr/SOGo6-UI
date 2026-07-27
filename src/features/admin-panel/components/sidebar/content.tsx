import { Database, Palette, Users, UserCog, BookOpen } from 'lucide-react'

const navItems = [
  {
    title: 'AP_SIDEBAR.theme.string',
    isActive: true,
    collapsedIcon: Palette,
    url: '/admin_panel/theme',
  },
  {
    title: 'AP_SIDEBAR.system.string',
    isActive: true,
    collapsedIcon: Database,
    url: '/admin_panel/system',
  },
  {
    title: 'AP_SIDEBAR.users.string',
    isActive: true,
    collapsedIcon: UserCog,
    url: '/admin_panel/users',
  },
  {
    title: 'AP_SIDEBAR.config.domains.string',
    items: [
      {
        title: 'AP_SIDEBAR.config.domains.default.string',
        url: '/admin_panel/domains/default',
      },
      {
        title: 'AP_SIDEBAR.config.domains.custom.string',
        url: '/admin_panel/domains/custom_domains',
      },
    ],
  },
  {
    title: 'AP_SIDEBAR.config.rules.string',
    url: '/admin_panel/rules',
  },
  {
    title: 'AP_SIDEBAR.sessions.string',
    isActive: true,
    collapsedIcon: Users,
    url: '/admin_panel/sessions',
  },
  {
    title: 'AP_SIDEBAR.api_docs.string',
    isActive: true,
    collapsedIcon: BookOpen,
    url: '/swagger-admin',
  },
]

export default navItems
