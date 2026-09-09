# Settings UI Module Specification

## Overview

The **Settings UI Module** provides user preference and configuration management for SOGo 6, built with React, TypeScript, Material-UI, and Redux Toolkit. It allows users to customize their experience across all modules.

**Status**: ✅ Complete (100%)
**Version**: 1.0.0
**Repository**: `sogo6-ui/`
**Parent Spec**: [SOGo 6 UI Project Specification](../project.spec.md)

---

## Features

### Profile Settings
- Edit personal information
- Change display name
- Update profile photo
- Set job title and organization
- Configure contact details
- Set pronouns and personal preferences

### Appearance Settings
- Theme selection (light, dark, system)
- Color scheme customization
- Font size and family
- Display density (comfortable, default, compact)
- Language and locale
- Date and time formatting
- Number formatting

### Mail Settings
- Default mailbox
- Message display preferences
- Compose settings
- Signature management
- Reading pane position
- Message preview options
- Threading and conversation view
- Notifications for new mail

### Calendar Settings
- Default calendar
- Work week configuration
- First day of week
- Working hours
- View preferences
- Time zone settings
- Event display preferences
- Notifications for events

### Contacts Settings
- Default address book
- Contact display preferences
- vCard export options
- Address book synchronization
- Auto-complete settings

### Notifications Settings
- Desktop notifications
- Email notifications
- Browser notifications
- Notification preferences per module
- Quiet hours
- Notification sounds

### Privacy and Security
- Password change
- Two-factor authentication
- Security questions
- Session management
- Active sessions
- Device management
- Privacy preferences

### Accessibility
- High contrast mode
- Reduced motion
- Color blindness mode
- Screen reader settings
- Keyboard shortcuts
- Font scaling

### Keyboard Shortcuts
- Customize shortcuts
- Reset to defaults
- Export/import shortcuts
- Keyboard shortcut guide

### Import and Export
- Export settings
- Import settings
- Reset to defaults
- Configuration backup

### Connected Accounts
- External calendar accounts
- External contact accounts
- Social media connections
- OAuth integrations
- Account synchronization settings

### Experimental Features
- Enable/disable beta features
- Feature flags
- A/B testing participation
- Early access programs

---

## Architecture

### Module Structure

```
src/app/features/settings/
├── SettingsFeature.tsx
├── SettingsRoute.tsx
├── components/
│   ├── SettingsLayout/
│   │   └── SettingsLayout.tsx
│   ├── SettingsNavigation/
│   │   └── SettingsNavigation.tsx
│   ├── SettingsSection/
│   │   └── SettingsSection.tsx
│   ├── ProfileSettings/
│   │   └── ProfileSettings.tsx
│   ├── AppearanceSettings/
│   │   └── AppearanceSettings.tsx
│   ├── MailSettings/
│   │   └── MailSettings.tsx
│   ├── CalendarSettings/
│   │   └── CalendarSettings.tsx
│   ├── ContactsSettings/
│   │   └── ContactsSettings.tsx
│   ├── NotificationSettings/
│   │   └── NotificationSettings.tsx
│   ├── SecuritySettings/
│   │   └── SecuritySettings.tsx
│   ├── AccessibilitySettings/
│   │   └── AccessibilitySettings.tsx
│   ├── KeyboardSettings/
│   │   └── KeyboardSettings.tsx
│   ├── AccountSettings/
│   │   └── AccountSettings.tsx
│   └── shared/
│       ├── SettingsItem/
│       │   └── SettingsItem.tsx
│       └── SettingsForm/
│           └── SettingsForm.tsx
│
├── hooks/
│   └── useSettings.ts
│
├── types/
│   └── settings.ts
│
├── slices/
│   └── settingsSlice.ts
│
└── api/
    └── settings.api.ts
```

---

## API Integration

- `GET /api/user/v1/settings` - Get user settings
- `PATCH /api/user/v1/settings` - Update user settings
- `GET /api/user/v1/settings/profile` - Get profile
- `PATCH /api/user/v1/settings/profile` - Update profile
- `GET /api/user/v1/settings/appearance` - Get appearance settings
- `PATCH /api/user/v1/settings/appearance` - Update appearance settings
- `GET /api/user/v1/settings/notifications` - Get notification settings
- `PATCH /api/user/v1/settings/notifications` - Update notification settings
- `POST /api/user/v1/settings/export` - Export settings
- `POST /api/user/v1/settings/import` - Import settings

---

## References

- [SOGo 6 UI Project Specification](../project.spec.md)
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
