import { Database, Palette, Users, UserCog, BookOpen, Shield, Building2, Activity, ScrollText, HardDrive, FileUp, Bug, Palette as BrandIcon, Archive, GitBranch, ArrowRightLeft, FileCode, Webhook, Key, FileText, Cloud, CalendarDays, CalendarClock, PenLine, Share2, GitBranch as ApprovalIcon, Ticket, Building2 as CrmIcon, Workflow, Zap, CalendarRange } from 'lucide-react'

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
    title: 'AP_SIDEBAR.webhooks.string',
    isActive: true,
    collapsedIcon: Webhook,
    url: '/admin_panel/webhooks',
  },
  {
    title: 'AP_SIDEBAR.oauth_clients.string',
    isActive: true,
    collapsedIcon: Key,
    url: '/admin_panel/oauth-clients',
  },
  {
    title: 'AP_SIDEBAR.scheduling_polls.string',
    isActive: true,
    collapsedIcon: CalendarDays,
    url: '/admin_panel/scheduling-polls',
  },
  {
    title: 'AP_SIDEBAR.appointment_slots.string',
    isActive: true,
    collapsedIcon: CalendarClock,
    url: '/admin_panel/appointment-slots',
  },
  {
    title: 'AP_SIDEBAR.shared_drafts.string',
    isActive: true,
    collapsedIcon: PenLine,
    url: '/admin_panel/shared-drafts',
  },
  {
    title: 'AP_SIDEBAR.file_sharing.string',
    isActive: true,
    collapsedIcon: Share2,
    url: '/admin_panel/file-sharing',
  },
  {
    title: 'AP_SIDEBAR.doc_preview.string',
    isActive: true,
    collapsedIcon: FileText,
    url: '/admin_panel/document-preview',
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
  {
    title: 'AP_SIDEBAR.approvals.string',
    isActive: true,
    collapsedIcon: ApprovalIcon,
    url: '/admin_panel/approvals',
  },
  {
    title: 'AP_SIDEBAR.helpdesk.string',
    isActive: true,
    collapsedIcon: Ticket,
    url: '/admin_panel/helpdesk',
  },
  {
    title: 'AP_SIDEBAR.crm.string',
    isActive: true,
    collapsedIcon: CrmIcon,
    url: '/admin_panel/crm',
  },
  {
    title: 'AP_SIDEBAR.workflows.string',
    isActive: true,
    collapsedIcon: Workflow,
    url: '/admin_panel/workflows',
  },
  {
    title: 'AP_SIDEBAR.quick_actions.string',
    isActive: true,
    collapsedIcon: Zap,
    url: '/admin_panel/quick-actions',
  },
  {
    title: 'AP_SIDEBAR.freebusy.string',
    isActive: true,
    collapsedIcon: CalendarRange,
    url: '/admin_panel/freebusy',
  },
  {
    title: 'PORTAL.title.string',
    isActive: true,
    collapsedIcon: Cloud,
    url: '/portal',
  },
]

export default navItems
