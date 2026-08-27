# Admin UI Module Specification

## Overview

The **Admin UI Module** provides the complete administration interface for SOGo 6, built with React, TypeScript, Material-UI, and Redux Toolkit. It enables system administrators to manage users, domains, organizations, and system-wide settings.

**Status**: ✅ Complete (100%)
**Version**: 1.0.0
**Repository**: `sogo6-ui/`
**Parent Spec**: [SOGo 6 UI Project Specification](../project.spec.md)
**Backend Spec**: [SOGo 6 Server Admin Module](../../sogo6-server/.openspec/specs/admin.spec.md)

---

## Features

### User Management
- Create, read, update, delete users
- Bulk user operations
- User import/export
- User filter and search
- Assign roles and permissions
- Reset passwords
- View user activity
- Manage user sessions
- Configure user quotas
- Edit user profiles

### Domain Management
- Create and configure domains
- Domain settings and policies
- Domain quotas
- Domain user limits
- Multi-tenant support
- Domain aliases
- Domain authentication settings

### Organization Management
- Department structure
- Organizational hierarchy
- Permissions inheritance
- Organization branding
- Office locations

### System Configuration
- General settings
- Mail server settings
- Authentication settings
- Database configuration
- Cache settings
- Logging configuration
- Backup settings

### Dashboard
- System overview
- Statistics and charts
- Monitoring widgets
- Activity feed
- System health indicators
- Alert management

### Audit & Logging
- System logs
- Authentication logs
- Mail logs
- Calendar logs
- Contact logs
- Admin action logs
- Log filtering and search
- Log export
- Real-time log tailing

### System Monitoring
- Resource usage (CPU, memory, disk)
- Service status
- Database performance
- Cache performance
- Mail queue monitoring
- WebSocket connections
- Active sessions
- System diagnostics
- Health checks

### Backup & Restore
- Configuration backup
- Data backup
- Automated backup schedules
- Restore from backup
- Export/import data
- Migration tools

### Security Management
- Authentication methods configuration
- Password policies
- IP access controls
- Rate limiting
- CORS settings
- SSL/TLS configuration
- API key management
- Security certificate management

### Module Management
- Enable/disable features
- Module configuration
- Third-party app integration
- API settings
- WebSocket settings

### License Management
- License information
- Feature activation
- Usage tracking
- License renewal

### Updates & Maintenance
- System update checks
- One-click updates
- Maintenance mode
- Update changelog

### Database Management
- Database connections
- Query browser
- Backup/restore
- Migration tools
- Database switch
- Performance optimization
- Index management

### Statistics & Analytics
- User activity reports
- System usage reports
- Mail traffic analysis
- Storage reports
- Performance metrics
- Custom reports
- Report export

### API Management
- API documentation viewer
- API rate limiting
- Caching configuration
- Version management
- Deprecation notices

---

## Architecture

### Module Structure

```
src/app/features/admin/
├── AdminFeature.tsx
├── AdminRoute.tsx
├── components/
│   ├── AdminLayout/
│   │   └── AdminLayout.tsx
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── DashboardCard.tsx
│   │   └── widgets/
│   │       ├── SystemHealth.tsx
│   │       ├── UserStats.tsx
│   │       ├── MailStats.tsx
│   │       └── ActivityFeed.tsx
│   │
│   ├── Users/
│   │   ├── UserList.tsx
│   │   ├── UserDialog.tsx
│   │   ├── UserForm.tsx
│   │   └── UserImportDialog.tsx
│   │
│   ├── Domains/
│   │   ├── DomainList.tsx
│   │   ├── DomainDialog.tsx
│   │   └── DomainForm.tsx
│   │
│   ├── Organizations/
│   │   ├── OrganizationTree.tsx
│   │   ├── OrganizationDialog.tsx
│   │   └── OrganizationForm.tsx
│   │
│   ├── Settings/
│   │   ├── GeneralSettings.tsx
│   │   ├── MailSettings.tsx
│   │   ├── AuthSettings.tsx
│   │   └── SystemSettings.tsx
│   │
│   ├── Logs/
│   │   ├── LogViewer.tsx
│   │   ├── LogFilter.tsx
│   │   └── LogExport.tsx
│   │
│   ├── Monitoring/
│   │   ├── ResourceMonitor.tsx
│   │   ├── ServiceStatus.tsx
│   │   └── PerformanceCharts.tsx
│   │
│   ├── Backup/
│   │   ├── BackupList.tsx
│   │   ├── BackupDialog.tsx
│   │   └── RestoreDialog.tsx
│   │
│   ├── Security/
│   │   ├── AuthMethods.tsx
│   │   ├── PasswordPolicies.tsx
│   │   ├── IPAccess Controls.tsx
│   │   └── Certificates.tsx
│   │
│   └── shared/
│       ├── AdminTable/
│       │   └── AdminTable.tsx
│       ├── AdminForm/
│       │   └── AdminForm.tsx
│       └── AdminDialog/
│           └── AdminDialog.tsx
│
├── hooks/
│   ├── useAdmin.ts
│   ├── useUsers.ts
│   ├── useDomains.ts
│   ├── useLogs.ts
│   └── useStats.ts
│
├── types/
│   ├── user.ts
│   ├── domain.ts
│   ├── settings.ts
│   └── stats.ts
│
├── slices/
│   ├── adminSlice.ts
│   └── statsSlice.ts
│
└── api/
    ├── admin.api.ts
    └── stats.api.ts
```

---

## API Integration

Consumes the [SOGo 6 Server Admin Module API](../../sogo6-server/.openspec/specs/admin.spec.md):

- `GET /api/admin/v1/users` - List users
- `POST /api/admin/v1/users` - Create user
- `GET /api/admin/v1/users/{id}` - Get user
- `PATCH /api/admin/v1/users/{id}` - Update user
- `DELETE /api/admin/v1/users/{id}` - Delete user
- `GET /api/admin/v1/domains` - List domains
- `POST /api/admin/v1/domains` - Create domain
- `GET /api/admin/v1/domains/{id}` - Get domain
- `PATCH /api/admin/v1/domains/{id}` - Update domain
- `DELETE /api/admin/v1/domains/{id}` - Delete domain
- `GET /api/admin/v1/logs` - View logs
- `GET /api/admin/v1/stats` - System statistics
- `GET /api/admin/v1/system` - System information
- `POST /api/admin/v1/backup` - Create backup
- `POST /api/admin/v1/restore` - Restore from backup

---

## References
\n### Cross-References

- [Root Architecture](../../.openspec/specs/architecture.spec.md)
- [Root Project Spec](../../.openspec/project.spec.md)
- [Server Admin Spec](../../sogo6-server/.openspec/specs/admin.spec.md)

- [SOGo 6 UI Project Specification](../project.spec.md)
- [SOGo 6 Server Admin Module](../../sogo6-server/.openspec/specs/admin.spec.md)
- [Material-UI Documentation](https://mui.com/)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-08-03 | Initial OpenSpec documentation |

## License

AGPL-3.0

## Maintainers

- Tobias Weiss

## Features

### ✅ Implemented Admin Features

- [x] Dashboard
- [x] User management
- [x] Domain management
- [x] System settings
- [x] Theme configuration
- [x] Security settings
- [x] Audit logs
- [x] Backup management
- [x] Configuration management
- [x] User CRUD operations
- [x] Domain CRUD operations
- [x] System monitoring
- [x] Health checks
- [x] Performance metrics
- [x] Resource usage
- [x] Service status
- [x] Database management
- [x] Cache management
- [x] Log viewing
- [x] Log filtering
- [x] Log export
- [x] Real-time monitoring
- [x] Alert management
- [x] Notification settings
- [x] Email configuration
- [x] LDAP configuration
- [x] OAuth configuration
- [x] SAML configuration
- [x] Password policies
- [x] Access controls
- [x] Rate limiting
- [x] IP whitelisting
- [x] SSL/TLS configuration
- [x] Certificate management
- [x] API key management
- [x] Version management
- [x] Update management
- [x] Maintenance mode
- [x] Migration tools

**Total: 40+ features**
