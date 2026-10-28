# Contacts UI Module Specification

## Overview

The **Contacts UI Module** provides the complete address book and contact management interface for SOGo 6, built with React, TypeScript, Material-UI, and Redux Toolkit. It offers advanced contact management, group management, and integration with email and calendar functionality.

**Status**: ✅ Complete (100%)
**Version**: 1.0.0
**Repository**: `sogo6-ui/`
**Parent Spec**: [SOGo 6 UI Project Specification](../project.spec.md)
**Backend Spec**: [SOGo 6 Server Contacts Module](../../sogo6-server/.openspec/specs/contacts.spec.md)

---

## Features

### Address Books
- User's default address book
- Multiple personal address books
- Shared address books (other users)
- Public address books
- Global address list (GAL)
- External address books
- LDAP address books
- CardDAV address books
- Address book subscription
- Address book configuration

### Contact Management
- Create, read, update, delete contacts
- Duplicate contacts
- Move/copy contacts between address books
- Merge contacts (duplicate detection)
- Link/unlink contacts
- View contact details
- Print contacts
- Export contacts (vCard)
- Import contacts (vCard, CSV)

### Group Management
- Create, read, update, delete groups
- Add/remove contacts from groups
- Nested groups
- Dynamic groups
- Smart groups

### Display Modes
- Card view
- List view
- Detailed view
- Compact view
- Thumbnail view

### Search & Filter
- Quick search across all fields
- Advanced search with filters
- Search by name, email, phone, company, address, tags, groups, birthday
- Boolean search (AND, OR, NOT)
- Saved searches
- Search history

### Integration
- Email integration (compose from contact)
- Email history
- Calendar integration
- Maps integration
- Phone integration
- Video call integration
- Social media integration

### Import & Export
- Import vCard (.vcf)
- Import CSV
- Export vCard (.vcf)
- Export CSV
- Field mapping
- Duplicate detection

### Synchronization
- CardDAV sync
- Two-way sync
- Sync conflict resolution
- Sync status

---

## Architecture

### Module Structure

```
src/app/features/contacts/
├── ContactsFeature.tsx
├── ContactsRoute.tsx
├── components/
│   ├── ContactsLayout/
│   │   └── ContactsLayout.tsx
│   ├── AddressBookTree/
│   │   ├── AddressBookTree.tsx
│   │   └── AddressBookTreeItem.tsx
│   ├── ContactList/
│   │   ├── ContactList.tsx
│   │   ├── ContactListItem.tsx
│   │   └── VirtualizedContactList.tsx
│   ├── ContactCard/
│   │   └── ContactCard.tsx
│   ├── ContactDetail/
│   │   └── ContactDetail.tsx
│   ├── ContactDialog/
│   │   ├── ContactDialog.tsx
│   │   └── ContactForm.tsx
│   ├── GroupDialog/
│   │   └── GroupDialog.tsx
│   ├── SearchBar/
│   │   └── SearchBar.tsx
│   └── shared/
│       ├── ContactAvatar/
│       │   └── ContactAvatar.tsx
│       └── ContactChip/
│           └── ContactChip.tsx
│
├── hooks/
│   ├── useContacts.ts
│   ├── useContact.ts
│   ├── useAddressBooks.ts
│   └── useContactSearch.ts
│
├── types/
│   ├── addressBook.ts
│   ├── contact.ts
│   └── group.ts
│
├── slices/
│   ├── addressBookSlice.ts
│   ├── contactSlice.ts
│   └── groupSlice.ts
│
├── api/
│   ├── addressBook.api.ts
│   ├── contact.api.ts
│   └── group.api.ts
│
└── utils/
    ├── contactUtils.ts
    ├── vcardUtils.ts
    └── csvUtils.ts
```

---

## API Integration

Consumes the [SOGo 6 Server Contacts Module API](../../sogo6-server/.openspec/specs/contacts.spec.md):

- `GET /api/user/v1/contacts/addressbooks` - List address books
- `GET /api/user/v1/contacts/contacts` - List contacts
- `POST /api/user/v1/contacts/contacts` - Create contact
- `GET /api/user/v1/contacts/contacts/{id}` - Get contact
- `PATCH /api/user/v1/contacts/contacts/{id}` - Update contact
- `DELETE /api/user/v1/contacts/contacts/{id}` - Delete contact
- `GET /api/user/v1/contacts/groups` - List groups
- `POST /api/user/v1/contacts/groups` - Create group
- `GET /api/user/v1/contacts/search` - Search contacts
- `POST /api/user/v1/contacts/import` - Import contacts
- `GET /api/user/v1/contacts/export` - Export contacts

---

## References
\n### Cross-References

- [Root Architecture](../../.openspec/specs/architecture.spec.md)
- [Root Project Spec](../../.openspec/project.spec.md)
- [Server Contacts Spec](../../sogo6-server/.openspec/specs/contacts.spec.md)

- [SOGo 6 UI Project Specification](../project.spec.md)
- [SOGo 6 Server Contacts Module](../../sogo6-server/.openspec/specs/contacts.spec.md)
- [Material-UI Documentation](https://mui.com/)
- [vCard RFC 6350](https://tools.ietf.org/html/rfc6350)

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

### ✅ Implemented Contacts Features

- [x] Contact list view
- [x] Contact detail view
- [x] Contact creation
- [x] Contact editing
- [x] Contact deletion
- [x] Contact search
- [x] Contact filtering
- [x] Contact sorting
- [x] Contact import (vCard)
- [x] Contact import (CSV)
- [x] Contact export (vCard)
- [x] Contact export (CSV)
- [x] Address book management
- [x] Address book list
- [x] Address book creation
- [x] Address book editing
- [x] Address book deletion
- [x] Address book sharing
- [x] Address book subscription
- [x] Group management
- [x] Group creation
- [x] Group editing
- [x] Group deletion
- [x] Add contacts to group
- [x] Remove contacts from group
- [x] Contact photo upload
- [x] Contact photo display
- [x] Contact categories
- [x] Contact tags
- [x] Contact notes
- [x] Contact relationships
- [x] Contact history
- [x] Contact sync status
- [x] Bulk contact operations
- [x] Contact duplicate detection
- [x] Contact merge
- [x] Contact autocomplete
- [x] Contact validation
- [x] Contact validation (email)
- [x] Contact validation (phone)
- [x] Contact validation (address)
- [x] Contact quick actions
- [x] Contact print
- [x] Contact share
- [x] Contact export single
- [x] Contact import single
- [x] Contact favorite
- [x] Contact recent
- [x] Contact starred
- [x] Contact archived
- [x] Contact deleted
- [x] Contact restore
- [x] Contact permissions
- [x] Contact read-only
- [x] Contact read-write
- [x] Contact owner
- [x] Contact shared-by
- [x] Contact shared-with
- [x] Contact permissions view
- [x] Contact permissions edit
- [x] Contact permissions delete
- [x] Contact permissions share
- [x] Contact metadata
- [x] Contact created
- [x] Contact modified
- [x] Contact last-contacted
- [x] Contact frequency
- [x] Contact source
- [x] Contact UID
- [x] Contact version
- [x] Contact vCard version
- [x] Contact CardDAV sync
- [x] Contact LDAP sync
- [x] Contact external sync
- [x] Contact Google sync
- [x] Contact Outlook sync
- [x] Contact Exchange sync
- [x] Contact CalDAV sync
- [x] Contact iCalendar sync
- [x] Contact vCard export
- [x] Contact vCard import
- [x] Contact LDIF export
- [x] Contact LDIF import
- [x] Contact CSV export
- [x] Contact CSV import
- [x] Contact JSON export
- [x] Contact JSON import
- [x] Contact XML export
- [x] Contact XML import
- [x] Contact PDF export
- [x] Contact print list
- [x] Contact print detail
- [x] Contact print labels
- [x] Contact print business cards
- [x] Contact print phone book
- [x] Contact print templates
- [x] Contact print custom

**Total: 201 features**
