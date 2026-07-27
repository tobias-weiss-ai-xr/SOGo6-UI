import { Database, Palette, Users, UserCog, BookOpen, Shield, Building2, Activity, ScrollText, HardDrive, FileUp, Bug, Palette as BrandIcon, Archive, GitBranch, ArrowRightLeft, FileCode } from 'lucide-react'

const navItems = [
  {
    title: 'AP_SIDEBAR.health.string',
    isActive: true,
    collapsedIcon: Activity,
    url: '/admin_panel/health',
  },
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
    title: 'AP_SIDEBAR.bulk_users.string',
    isActive: true,
    collapsedIcon: FileUp,
    url: '/admin_panel/bulk-users',
  },
  {
    title: 'AP_SIDEBAR.quotas.string',
    isActive: true,
    collapsedIcon: HardDrive,
    url: '/admin_panel/quotas',
  },
  {
    title: 'AP_SIDEBAR.branding.string',
    isActive: true,
    collapsedIcon: BrandIcon,
    url: '/admin_panel/branding',
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
    title: 'AP_SIDEBAR.audit.string',
    isActive: true,
    collapsedIcon: ScrollText,
    url: '/admin_panel/audit',
  },
  {
    title: 'AP_SIDEBAR.debug.string',
    isActive: true,
    collapsedIcon: Bug,
    url: '/admin_panel/debug',
  },
  {
    title: 'AP_SIDEBAR.backup.string',
    isActive: true,
    collapsedIcon: Archive,
    url: '/admin_panel/backup',
  },
  {
    title: 'AP_SIDEBAR.db_migration.string',
    isActive: true,
    collapsedIcon: GitBranch,
    url: '/admin_panel/db-migration',
  },
  {
    title: 'AP_SIDEBAR.migration.string',
    isActive: true,
    collapsedIcon: ArrowRightLeft,
    url: '/admin_panel/migration',
  },
  {
    title: 'AP_SIDEBAR.config_code.string',
    isActive: true,
    collapsedIcon: FileCode,
    url: '/admin_panel/config-code',
  },
  {
    title: 'AP_SIDEBAR.api_docs.string',
    isActive: true,
    collapsedIcon: BookOpen,
    url: '/swagger-admin',
  },
  {
    title: 'AP_SIDEBAR.dns_wizard.string',
    isActive: true,
    collapsedIcon: Shield,
    url: '/admin_panel/dns-wizard',
  },
  {
    title: 'AP_SIDEBAR.resources.string',
    isActive: true,
    collapsedIcon: Building2,
    url: '/admin_panel/resources',
  },
]

export default navItems
