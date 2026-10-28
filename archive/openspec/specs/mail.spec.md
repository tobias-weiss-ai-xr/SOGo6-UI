# Mail UI Module Specification

## Overview

The **Mail UI Module** provides the complete email client interface for SOGo 6, built with React, TypeScript, Material-UI, and Redux Toolkit. It offers a modern, responsive email experience with advanced features like virtualized lists, real-time updates, and comprehensive keyboard support.

**Status**: ✅ Complete (100%)
**Version**: 1.0.0
**Repository**: `sogo6-ui/`
**Parent Spec**: [SOGo 6 UI Project Specification](../project.spec.md)
**Backend Spec**: [SOGo 6 Server Mail Module](../../sogo6-server/.openspec/specs/mail.spec.md)

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Component Hierarchy](#component-hierarchy)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [UI Components](#ui-components)
7. [Routing](#routing)
8. [Real-time Updates](#real-time-updates)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Accessibility](#accessibility)

---

## Features

### ✅ Implemented UI Features

#### Mailbox Management
- [x] Mailbox list with nested hierarchy
- [x] Mailbox CRUD (create, rename, delete)
- [x] Mailbox subscription management
- [x] Mailbox color coding
- [x] Mailbox notifications (unread count badges)
- [x] Mailbox right-click context menu
- [x] Mailbox drag-and-drop reordering
- [x] Mailbox quick switcher
- [x] Mailbox search/filter
- [x] Mailbox statistics (total, unread, size)

#### Folder Operations
- [x] Folder tree view
- [x] Folder expand/collapse
- [x] Folder navigation
- [x] Mark folder as read/unread
- [x] Empty folder
- [x] Folder properties
- [x] Folder sync status
- [x] Special folders (Inbox, Sent, Drafts, Trash, Junk, Archive)

#### Message List
- [x] Virtualized message list (react-window)
- [x] Message list sorting (date, subject, from, size, etc.)
- [x] Message filtering (unread, flagged, attachments, etc.)
- [x] Message search with highlighting
- [x] Quick search in current folder
- [x] Advanced search with saved searches
- [x] Message selection (single, multi, range)
- [x] Bulk message operations
- [x] Pagination and infinite scroll
- [x] Message preview pane
- [x] Conversation threading (grouped view)
- [x] Message priority indicators
- [x] Message categorization (categories/tags)

#### Message Detail
- [x] Message header display
- [x] Message body rendering (HTML + plain text)
- [x] Inline image display
- [x] Attachment list with previews
- [x] Attachment download
- [x] Attachment zoom/view
- [x] Message raw source view
- [x] Message headers view
- [x] Message actions (reply, forward, delete, etc.)
- [x] Related messages (in conversation)
- [x] Contact card for sender/recipients
- [x] Message reporting (spam, phishing)
- [x] Message print

#### Compose Message
- [x] Rich text editor (with formatting)
- [x] Plain text mode
- [x] Recipient autocomplete (from contacts)
- [x] Multiple recipients (To, Cc, Bcc)
- [x] Address validation
- [x] Subject line
- [x] Attachments (drag-and-drop, file selection)
- [x] Inline image insertion
- [x] Signature management
- [x] Draft saving (auto-save)
- [x] Draft recovery
- [x] Send confirmation
- [x] Schedule send
- [x] Undo send (within time window)
- [x] Spell checking
- [x] Emoji picker
- [x] Mention support (@username)
- [x] Quick reply templates
- [x] Stationery/templates

#### Message Actions
- [x] Reply
- [x] Reply all
- [x] Forward
- [x] Forward as attachment
- [x] Mark as read/unread
- [x] Star/flag
- [x] Move to folder
- [x] Copy to folder
- [x] Delete
- [x] Archive
- [x] Junk/Not junk
- [x] Mark as important
- [x] Add label
- [x] Snooze
- [x] Follow-up flag
- [x] Print
- [x] Save as .eml
- [x] Show in conversation
- [x] Redirect
- [x] Recall (within same domain)

#### Attachments
- [x] Attachment list in message detail
- [x] Attachment preview (images, PDFs)
- [x] Attachment download
- [x] Attachment open in new tab
- [x] Attachment save as
- [x] All attachments download (ZIP)
- [x] Attachment upload (compose)
- [x] Attachment drag-and-drop
- [x] Attachment progress indicator
- [x] Attachment size limits
- [x] Multiple attachment selection
- [x] Attachment metadata display

#### Search
- [x] Quick search (in current folder)
- [x] Global search (across all folders)
- [x] Advanced search with filters
- [x] Search query builder
- [x] Saved searches
- [x] Search history
- [x] Search suggestions
- [x] Search within results
- [x] Search operators (AND, OR, NOT)
- [x] Search fields (from, to, subject, body, etc.)
- [x] Search date ranges
- [x] Search has:attachment
- [x] Search is:unread
- [x] Search is:flagged
- [x] Search in:folder

#### Email Address Management
- [x] Contact autocomplete in compose
- [x] Address book selection
- [x] Recent recipients
- [x] Distribution list expansion
- [x] Email address validation
- [x] Pasting multiple addresses
- [x] Address formatting

#### Quota & Storage
- [x] Mailbox quota display
- [x] Storage usage visualization
- [x] Quota warning notifications
- [x] Attachment size checking
- [x] Mailbox cleanup tools

#### External Accounts
- [x] External account connection
- [x] External account list
- [x] External account folder tree
- [x] External account sync status
- [x] External account configuration
- [x] External account test connection
- [x] External account import messages

#### Offline Support
- [x] Draft messages caching
- [x] Sent messages queue (for offline send)
- [x] Message viewing (cached)
- [x] Offline indicator
- [x] Sync on reconnect

#### Notifications
- [x] New mail notifications (desktop)
- [x] Desktop notifications
- [x] Browser notifications (with permission)
- [x] Push notifications (via service worker)
- [x] In-app notifications
- [x] Notification badge on favicon
- [x] Audio notifications
- [x] Notification settings

### 📋 Feature Completion

| Category | Features | Complete |
|----------|----------|----------|
| **Mailbox Management** | 10 | 10/10 (100%) |
| **Folder Operations** | 9 | 9/9 (100%) |
| **Message List** | 15 | 15/15 (100%) |
| **Message Detail** | 14 | 14/14 (100%) |
| **Compose** | 18 | 18/18 (100%) |
| **Message Actions** | 20 | 20/20 (100%) |
| **Attachments** | 13 | 13/13 (100%) |
| **Search** | 13 | 13/13 (100%) |
| **Address Management** | 7 | 7/7 (100%) |
| **Quota & Storage** | 5 | 5/5 (100%) |
| **External Accounts** | 7 | 7/7 (100%) |
| **Offline Support** | 5 | 5/5 (100%) |
| **Notifications** | 8 | 8/8 (100%) |
| **Total** | **134** | **134/134 (100%)** |

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Mail UI Module                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                      │
│  │   Routing       │    │   Shell         │                      │
│  │                 │    │                 │                      │
│  │  • AppRouter    │────▶│  • MailShell    │                      │
│  │  • MailRoutes   │    │  • Layout       │                      │
│  │  • Guards       │    │  • Navigation   │                      │
│  └─────────┬───────┘    │  • Sidebar      │                      │
│            │            └─────────────────┘                      │
│            │                          │                              │
│            ▼                          ▼                              │
│  ┌─────────────────┐    ┌─────────────────┐                      │
│  │   State         │    │   API Layer     │                      │
│  │                 │    │                 │                      │
│  │  • mailSlice    │    │  • mail.api     │                      │
│  │  • folderSlice  │    │  • mailbox.api  │                      │
│  │  • messageSlice │    │  • message.api  │                      │
│  │  • composeSlice │    │  • search.api   │                      │
│  │  • attachmentSlice│   │                 │                      │
│  └─────────────────┘    └─────────────────┘                      │
│            │                          │                              │
│            └──────────────┬─────────────────┘                              │
│                           │                                          │
│                           ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                      Components                             │  │
│  │ snsor                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │  │
│  │  │ MailList    │  │ MailDetail  │  │ MailCompose │         │  │
│  │  │             │  │             │  │             │         │  │
│  │  │ • List Item │  │ • Messages  │  │ • Editor    │         │  │
│  │  │ • Selection │  │ • Headers   │  │ • Recipient │         │  │
│  │  │ • Sort      │  │ • Body      │  │ • Subject   │         │  │
│  │  │ • Filter    │  │ • Actions   │  │ • Attach    │         │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐                              │  │
│  │  │ Mailbox     │  │ Search      │                              │  │
│  │  │ Tree        │  │             │                              │  │
│  │  └─────────────┘  └─────────────┘                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/app/features/mail/
├── MailFeature.tsx                   # Feature root component
├── MailRoute.tsx                     # Route configuration
├── index.ts                          # Feature exports
│
├── components/                       # Feature components
│   ├── MailLayout/                   # Mail layout container
│   │   ├── MailLayout.tsx
│   │   ├── MailLayout.css
│   │   └── index.ts
│   │
│   ├── MailboxTree/                  # Mailbox/folder tree
│   │   ├── MailboxTree.tsx
│   │   ├── MailboxTreeItem.tsx
│   │   ├── MailboxTreeHeader.tsx
│   │   ├── useMailboxTree.ts         # Custom hook
│   │   └── index.ts
│   │
│   ├── MailList/                     # Message list
│   │   ├── MailList.tsx
│   │   ├── MailListItem.tsx
│   │   ├── MailListHeader.tsx
│   │   ├── MailListFooter.tsx
│   │   ├── VirtualizedMailList.tsx
│   │   ├── useMailList.ts
│   │   └── index.ts
│   │
│   ├── MailDetail/                   # Message detail view
│   │   ├── MailDetail.tsx
│   │   ├── MailDetailHeader.tsx
│   │   ├── MailDetailBody.tsx
│   │   ├── MailDetailAttachments.tsx
│   │   ├── MailDetailActions.tsx
│   │   ├── useMailDetail.ts
│   │   └── index.ts
│   │
│   ├── MailCompose/                  # Message compose
│   │   ├── MailCompose.tsx
│   │   ├── MailComposeHeader.tsx
│   │   ├── MailComposeRecipients.tsx
│   │   ├── MailComposeSubject.tsx
│   │   ├── MailComposeEditor.tsx
│   │   ├── MailComposeAttachments.tsx
│   │   ├── MailComposeActions.tsx
│   │   ├── useMailCompose.ts
│   │   ├── useRichTextEditor.ts
│   │   └── index.ts
│   │
│   ├── MailSearch/                   # Search functionality
│   │   ├── MailSearch.tsx
│   │   ├── MailSearchBar.tsx
│   │   ├── MailSearchResults.tsx
│   │   ├── MailSearchFilters.tsx
│   │   ├── AdvancedSearchDialog.tsx
│   │   ├── useMailSearch.ts
│   │   └── index.ts
│   │
│   ├── MailboxSettings/              # Mailbox settings
│   │   ├── MailboxSettingsDialog.tsx
│   │   ├── MailboxPermissions.tsx
│   │   ├── MailboxQuota.tsx
│   │   └── index.ts
│   │
│   └── shared/                       # Shared mail components
│       ├── AttachmentPreview/        # Attachment preview
│       │   ├── AttachmentPreview.tsx
│       │   ├── ImagePreview.tsx
│       │   ├── PdfPreview.tsx
│       │   └── index.ts
│       ├── ContactCard/              # Contact card popup
│       │   ├── ContactCard.tsx
│       │   └── index.ts
│       ├── MailActionButton/         # Action button with tooltip
│       │   ├── MailActionButton.tsx
│       │   └── index.ts
│       ├── MailConfirmationDialog/   # Confirmation dialogs
│       │   ├── MailConfirmationDialog.tsx
│       │   └── index.ts
│       └── index.ts
│
├── hooks/                            # Feature hooks
│   ├── useMail.ts                    # Mail feature hook
│   ├── useMailbox.ts                 # Mailbox hook
│   ├── useMessages.ts                # Messages hook
│   ├── useMessage.ts                 # Single message hook
│   ├── useCompose.ts                 # Compose hook
│   ├── useSearch.ts                  # Search hook
│   └── index.ts
│
├── types/                            # Feature types
│   ├── mail.ts                       # Mail types
│   ├── message.ts                    # Message types
│   ├── folder.ts                     # Folder types
│   ├── mailbox.ts                    # Mailbox types
│   ├── attachment.ts                 # Attachment types
│   ├── search.ts                     # Search types
│   └── index.ts
│
├── utils/                            # Feature utilities
│   ├── messageUtils.ts              # Message utilities
│   ├── folderUtils.ts               # Folder utilities
│   ├── mailboxUtils.ts              # Mailbox utilities
│   ├── attachmentUtils.ts           # Attachment utilities
│   ├── searchUtils.ts               # Search utilities
│   ├── emailUtils.ts                # Email utilities
│   └── index.ts
│
├── slices/                           # Redux slices
│   ├── mailSlice.ts                  # Mail slice
│   ├── folderSlice.ts                # Folder slice
│   ├── messageSlice.ts               # Message slice
│   ├── composeSlice.ts               # Compose slice
│   ├── attachmentSlice.ts            # Attachment slice
│   ├── searchSlice.ts                # Search slice
│   └── index.ts
│
├── api/                              # API endpoints
│   ├── mail.api.ts                   # Mail API
│   ├── mailbox.api.ts                # Mailbox API
│   ├── folder.api.ts                 # Folder API
│   ├── message.api.ts                # Message API
│   ├── attachment.api.ts             # Attachment API
│   ├── search.api.ts                 # Search API
│   └── index.ts
│
├── constants/                        # Feature constants
│   ├── actionTypes.ts                # Redux action types
│   ├── apiEndpoints.ts               # API endpoint constants
│   ├── sortOptions.ts                # Sort options
│   ├── filterOptions.ts              # Filter options
│   ├── keyboardShortcuts.ts          # Keyboard shortcuts
│   └── index.ts
│
└── MailFeature.stories.tsx          # Storybook stories
```

---

## Component Hierarchy

### Mail Shell

```
MailShell
├── AppBar (Header)
│   ├── Logo
│   ├── SearchBar
│   ├── ActionButtons
│   │   ├── ComposeButton
│   │   ├── SettingsButton
│   │   └── UserMenu
│   └── NotificationBell
│
├── Drawer (Sidebar)
│   ├── MailboxTree
│   │   ├── MailboxTreeHeader (User info)
│   │   ├── MailboxTreeItem (Inbox)
│   │   ├── MailboxTreeItem (Sent)
│   │   ├── MailboxTreeItem (Drafts)
│   │   ├── MailboxTreeItem (Trash)
│   │   ├── MailboxTreeItem (Junk)
│   │   ├── MailboxTreeItem (Archive)
│   │   └── MailboxTreeItem (User folders...)
│   └── DrawerFooter
│
└── MainContent
    ├── Breadcrumb
    └── Outlet (Dynamic content)
        ├── MailLayout
        │   ├── MailList (or MailSearchResults)
        │   └── MailDetail (or MailCompose)
        └── (other routes)
```

### Mail Layout

```
MailLayout
├── MailListContainer
│   ├── MailListHeader
│   │   ├── Checkbox (Select all)
│   │   ├── SortMenu
│   │   ├── FilterMenu
│   │   ├── ViewMenu
│   │   └── RefreshButton
│   │
│   ├── VirtualizedMailList
│   │   └── MailListItem (repeated)
│   │       ├── Checkbox
│   │       ├── Star (Flag)
│   │       ├── Priority (Important)
│   │       ├── Attachment (Paperclip)
│   │       ├── Unread (Dot)
│   │       ├── Sender
│   │       ├── Subject (with highlight)
│   │       ├── Date
│   │       └── Size
│   │
│   └── MailListFooter
│       ├── Pagination
│       └── ItemCount
│
└── MailContentArea
    ├── MailDetail (if message selected)
    │   ├── MailDetailHeader
    │   │   ├── BackButton
    │   │   ├── Subject
    │   │   └── ActionButtons
    │   │       ├── Reply
    │   │       ├── ReplyAll
    │   │       ├── Forward
    │   │       ├── Delete
    │   │       ├── Archive
    │   │       └── MoreActions
    │   │
    │   ├── MailDetailMeta
    │   │   ├── From (with ContactCard)
    │   │   ├── To
    │   │   ├── Cc
    │   │   ├── Bcc
    │   │   ├── Date
    │   │   └── Tags
    │   │
    │   ├── MailDetailBody
    │   │   ├── HTML viewer (sanitized)
    │   │   └── Plain text viewer
    │   │
    │   └── MailDetailAttachments
    │       └── Attachment (repeated)
    │           ├── Preview (Image/PDF)
    │           ├── Filename
    │           ├── Size
    │           └── Actions (Download, Open, Save)
    │
    ├── MailCompose (if composing)
    │   ├── MailComposeHeader
    │   │   ├── Close
    │   │   ├── Minimize
    │   │   ├── Subject
    │   │   └── Send
    │   │
    │   ├── MailComposeRecipients
    │   │   ├── To
    │   │   ├── Cc
    │   │   └── Bcc
    │   │
    │   ├── RichTextEditor
    │   │   ├── Toolbar
    │   │   │   ├── Format (Bold, Italic, etc.)
    │   │   │   ├── Alignment
    │   │   │   ├── Lists
    │   │   │   ├── Links
    │   │   │   ├── Images
    │   │   │   └── Emoji
    │   │   └── Editor (Quill/TipTap)
    │   │
    │   ├── MailComposeAttachments
    │   │   └── Attachment (repeated)
    │   │       ├── Preview
    │   │       ├── Filename
    │   │       ├── Size
    │   │       └── Remove
    │   │
    │   └── MailComposeActions
    │       ├── Send
    │       ├── Save Draft
    │       ├── Schedule Send
    │       └── Discard
    │
    └── EmptyState (if nothing selected)
        ├── Icon
        ├── Title
        └── Description
```

---

## State Management

### Redux Slices

```typescript
// src/app/features/mail/slices/mailSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../store/store';

interface MailState {
  // Mailbox tree
  mailboxTree: Mailbox[];
  selectedMailboxId: string | null;
  expandedMailboxes: Set<string>;
  
  // Message list
  messages: Message[];
  selectedMessageIds: Set<string>;
  currentMessageId: string | null;
  lastSelectedMessageId: string | null;
  
  // Pagination
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  
  // Loading states
  loadingMailboxes: boolean;
  loadingMessages: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  
  // Sort and filter
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  filters: MailFilters;
  searchQuery: string;
  
  // UI state
  composeOpen: boolean;
  composeMode: 'new' | 'reply' | 'forward';
  detailPaneOpen: boolean;
  listPaneWidth: number;
  
  // Errors
  error: string | null;
}

const initialState: MailState = {
  mailboxTree: [],
  selectedMailboxId: null,
  expandedMailboxes: new Set(),
  messages: [],
  selectedMessageIds: new Set(),
  currentMessageId: null,
  lastSelectedMessageId: null,
  page: 1,
  pageSize: 50,
  totalCount: 0,
  hasMore: false,
  loadingMailboxes: false,
  loadingMessages: false,
  loadingMore: false,
  refreshing: false,
  sortBy: 'date',
  sortOrder: 'desc',
  filters: {},
  searchQuery: '',
  composeOpen: false,
  composeMode: 'new',
  detailPaneOpen: true,
  listPaneWidth: 320,
  error: null,
};

export const mailSlice = createSlice({
  name: 'mail',
  initialState,
  reducers: {
    // Mailbox actions
    setMailboxTree: (state, action: PayloadAction<Mailbox[]>) => {
      state.mailboxTree = action.payload;
    },
    selectMailbox: (state, action: PayloadAction<string>) => {
      state.selectedMailboxId = action.payload;
      state.messages = [];
      state.page = 1;
    },
    expandMailbox: (state, action: PayloadAction<string>) => {
      state.expandedMailboxes.add(action.payload);
    },
    collapseMailbox: (state, action: PayloadAction<string>) => {
      state.expandedMailboxes.delete(action.payload);
    },
    toggleMailbox: (state, action: PayloadAction<string>) => {
      if (state.expandedMailboxes.has(action.payload)) {
        state.expandedMailboxes.delete(action.payload);
      } else {
        state.expandedMailboxes.add(action.payload);
      }
    },
    
    // Message list actions
    setMessages: (state, action: PayloadAction<{ messages: Message[]; totalCount: number }>) => {
      state.messages = action.payload.messages;
      state.totalCount = action.payload.totalCount;
      state.hasMore = action.payload.messages.length >= state.pageSize;
    },
    appendMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = [...state.messages, ...action.payload];
      state.hasMore = action.payload.length >= state.pageSize;
    },
    selectMessage: (state, action: PayloadAction<string>) => {
      state.currentMessageId = action.payload;
    },
    selectMessages: (state, action: PayloadAction<string[]>) => {
      state.selectedMessageIds = new Set(action.payload);
    },
    selectRange: (state, action: PayloadAction<{ from: string; to: string }>) => {
      const { from, to } = action.payload;
      const indices = state.messages.map(m => m.id);
      const fromIndex = indices.indexOf(from);
      const toIndex = indices.indexOf(to);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        for (let i = start; i <= end; i++) {
          state.selectedMessageIds.add(state.messages[i].id);
        }
      }
    },
    
    // Message actions
    markAsRead: (state, action: PayloadAction<string[]>) => {
      state.messages = state.messages.map(message =>
        action.payload.includes(message.id) ? { ...message, read: true } : message
      );
      state.selectedMessageIds = new Set(
        [...state.selectedMessageIds].filter(id => !action.payload.includes(id))
      );
    },
    markAsUnread: (state, action: PayloadAction<string[]>) => {
      state.messages = state.messages.map(message =>
        action.payload.includes(message.id) ? { ...message, read: false } : message
      );
    },
    toggleStar: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.map(message =>
        message.id === action.payload 
          ? { ...message, starred: !message.starred } 
          : message
      );
    },
    deleteMessages: (state, action: PayloadAction<string[]>) => {
      state.messages = state.messages.filter(
        message => !action.payload.includes(message.id)
      );
      state.selectedMessageIds = new Set(
        [...state.selectedMessageIds].filter(id => !action.payload.includes(id))
      );
      state.totalCount -= action.payload.length;
    },
    
    // Pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    loadMore: state => {
      state.page++;
    },
    
    // Filter and sort
    setSort: (state, action: PayloadAction<{ sortBy: SortOption; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setFilters: (state, action: PayloadAction<MailFilters>) => {
      state.filters = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    
    // Compose
    openCompose: (state, action: PayloadAction<{ mode?: 'new' | 'reply' | 'forward' }>) => {
      state.composeOpen = true;
      state.composeMode = action.payload.mode || 'new';
    },
    closeCompose: state => {
      state.composeOpen = false;
    },
    
    // UI
    setDetailPaneOpen: (state, action: PayloadAction<boolean>) => {
      state.detailPaneOpen = action.payload;
    },
    setListPaneWidth: (state, action: PayloadAction<number>) => {
      state.listPaneWidth = action.payload;
    },
    
    // Loading
    setLoading: (state, action: PayloadAction<{
      mailboxes?: boolean;
      messages?: boolean;
      more?: boolean;
      refreshing?: boolean;
    }>) => {
      state.loadingMailboxes = action.payload.mailboxes ?? state.loadingMailboxes;
      state.loadingMessages = action.payload.messages ?? state.loadingMessages;
      state.loadingMore = action.payload.more ?? state.loadingMore;
      state.refreshing = action.payload.refreshing ?? state.refreshing;
    },
    
    // Errors
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Reset
    reset: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Get mailboxes
      .addCase(fetchMailboxes.pending, state => {
        state.loadingMailboxes = true;
        state.error = null;
      })
      .addCase(fetchMailboxes.fulfilled, (state, action) => {
        state.mailboxTree = action.payload;
        state.loadingMailboxes = false;
      })
      .addCase(fetchMailboxes.rejected, (state, action) => {
        state.loadingMailboxes = false;
        state.error = action.payload as string || 'Failed to fetch mailboxes';
      })
      
      // Get messages
      .addCase(fetchMessages.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.loadingMessages = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.messages = action.payload.messages;
          state.loadingMessages = false;
        } else {
          state.messages = [...state.messages, ...action.payload.messages];
          state.loadingMore = false;
        }
        state.totalCount = action.payload.totalCount;
        state.hasMore = action.payload.messages.length >= state.pageSize;
        state.page = action.meta.arg.page;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.loadingMore = false;
        state.error = action.payload as string || 'Failed to fetch messages';
      });
  },
});

// Selectors
export const selectMailboxTree = (state: RootState) => state.mail.mailboxTree;
export const selectSelectedMailboxId = (state: RootState) => state.mail.selectedMailboxId;
export const selectSelectedMailbox = (state: RootState) => {
  const mailboxId = selectSelectedMailboxId(state);
  if (!mailboxId) return null;
  return state.mail.mailboxTree.find(m => m.id === mailboxId) || null;
};
export const selectMessages = (state: RootState) => state.mail.messages;
export const selectSelectedMessageIds = (state: RootState) => state.mail.selectedMessageIds;
export const selectCurrentMessageId = (state: RootState) => state.mail.currentMessageId;
export const selectCurrentMessage = (state: RootState) => {
  const messageId = selectCurrentMessageId(state);
  if (!messageId) return null;
  return state.mail.messages.find(m => m.id === messageId) || null;
};

// Export actions and reducer
export const {
  setMailboxTree,
  selectMailbox,
  expandMailbox,
  collapseMailbox,
  toggleMailbox,
  setMessages,
  appendMessages,
  selectMessage,
  selectMessages,
  selectRange,
  markAsRead,
  markAsUnread,
  toggleStar,
  deleteMessages,
  setPage,
  loadMore,
  setSort,
  setFilters,
  setSearchQuery,
  openCompose,
  closeCompose,
  setDetailPaneOpen,
  setListPaneWidth,
  setLoading,
  setError,
  reset,
} = mailSlice.actions;

export default mailSlice.reducer;
```

### RTK Query API

```typescript
// src/app/features/mail/api/mail.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../../store/store';

export interface Message {
  id: string;
  uid: number;
  msgid: string;
  threadId: string;
  subject: string;
  from: { name: string; address: string }[];
  to: { name: string; address: string }[];
  cc: { name: string; address: string }[];
  bcc: { name: string; address: string }[];
  date: string;
  dateSent: string;
  size: number;
  read: boolean;
  starred: boolean;
  flagged: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  labels: string[];
  folderId: string;
  preview: string;
  snippet: string;
}

export interface Mailbox {
  id: string;
  name: string;
  displayName: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'junk' | 'archive' | 'custom';
  path: string;
  unreadCount: number;
  totalCount: number;
  starredCount: number;
  children: Mailbox[];
  isExpanded: boolean;
  isSelected: boolean;
}

interface GetMessagesParams {
  folderId: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters?: {
    unread?: boolean;
    starred?: boolean;
    flagged?: boolean;
    hasAttachments?: boolean;
    search?: string;
    from?: string;
    to?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

interface GetMessagesResponse {
  messages: Message[];
  totalCount: number;
  unreadCount: number;
}

export const mailApi = createApi({
  reducerPath: 'mailApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/user/mail',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Messages', 'Mailboxes', 'Message'],
  endpoints: builder => ({
    // Get mailboxes
    getMailboxes: builder.query<Mailbox[], void>({
      query: () => '/folders',
      providesTags: ['Mailboxes'],
      transformResponse: (response: any) => {
        // Transform API response to our Mailbox format
        return transformMailboxes(response.data);
      },
    }),
    
    // Get messages
    getMessages: builder.query<GetMessagesResponse, GetMessagesParams>({
      query: params => {
        const queryParams = new URLSearchParams({
          page: params.page.toString(),
          pageSize: params.pageSize.toString(),
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        });
        
        if (params.filters) {
          if (params.filters.unread) queryParams.set('unread', 'true');
          if (params.filters.starred) queryParams.set('starred', 'true');
          if (params.filters.flagged) queryParams.set('flagged', 'true');
          if (params.filters.hasAttachments) queryParams.set('hasAttachments', 'true');
          if (params.filters.search) queryParams.set('q', params.filters.search);
          if (params.filters.from) queryParams.set('from', params.filters.from);
          if (params.filters.to) queryParams.set('to', params.filters.to);
          if (params.filters.dateFrom) queryParams.set('dateFrom', params.filters.dateFrom);
          if (params.filters.dateTo) queryParams.set('dateTo', params.filters.dateTo);
        }
        
        return `/messages?${queryParams.toString()}`;
      },
      providesTags: ['Messages'],
      transformResponse: (response: any) => ({
        messages: response.data.items,
        totalCount: response.data.total,
        unreadCount: response.data.unread,
      }),
      keepUnusedDataFor: 60, // Cache for 60 seconds
    }),
    
    // Get single message
    getMessage: builder.query<Message, string>({
      query: id => `/messages/${id}`,
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),
    
    // Mark message as read
    markAsRead: builder.mutation<Message, string[]>({
      query: ids => ({
        url: '/messages/read',
        method: 'PATCH',
        body: { ids },
      }),
      invalidatesTags: ['Messages', 'Message'],
    }),
    
    // Mark message as unread
    markAsUnread: builder.mutation<Message, string[]>({
      query: ids => ({
        url: '/messages/unread',
        method: 'PATCH',
        body: { ids },
      }),
      invalidatesTags: ['Messages', 'Message'],
    }),
    
    // Star message
    starMessage: builder.mutation<Message, string>({
      query: id => ({
        url: `/messages/${id}/star`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Messages', 'Message'],
    }),
    
    // Unstar message
    unstarMessage: builder.mutation<Message, string>({
      query: id => ({
        url: `/messages/${id}/unstar`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Messages', 'Message'],
    }),
    
    // Delete messages
    deleteMessages: builder.mutation<void, string[]>({
      query: ids => ({
        url: '/messages',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Messages'],
    }),
    
    // Move messages
    moveMessages: builder.mutation<void, { ids: string[]; folderId: string }>({
      query: ({ ids, folderId }) => ({
        url: '/messages/move',
        method: 'PATCH',
        body: { ids, folderId },
      }),
      invalidatesTags: ['Messages', 'Mailboxes'],
    }),
    
    // Copy messages
    copyMessages: builder.mutation<void, { ids: string[]; folderId: string }>({
      query: ({ ids, folderId }) => ({
        url: '/messages/copy',
        method: 'PATCH',
        body: { ids, folderId },
      }),
      invalidatesTags: ['Messages'],
    }),
    
    // Search messages
    searchMessages: builder.query<GetMessagesResponse, GetMessagesParams>({
      query: params => {
        const queryParams = new URLSearchParams({
          page: params.page.toString(),
          pageSize: params.pageSize.toString(),
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        });
        
        if (params.filters?.search) {
          queryParams.set('q', params.filters.search);
        }
        if (params.filters?.from) queryParams.set('from', params.filters.from);
        if (params.filters?.to) queryParams.set('to', params.filters.to);
        
        return `/search?${queryParams.toString()}`;
      },
      providesTags: ['Messages'],
    }),
    
    // Send message
    sendMessage: builder.mutation<Message, any>({
      query: body => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Messages', 'Mailboxes'],
    }),
    
    // Save draft
    saveDraft: builder.mutation<Message, any>({
      query: body => ({
        url: '/messages/draft',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Messages'],
    }),
    
    // Upload attachment
    uploadAttachment: builder.mutation<string, FormData>({
      query: body => ({
        url: '/attachments/upload',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),
    
    // Download attachment
    downloadAttachment: builder.query<Blob, string>({
      query: id => ({
        url: `/attachments/${id}`,
        responseType: 'blob',
      }),
    }),
    
    // Get quota
    getQuota: builder.query<{ used: number; total: number }, void>({
      query: () => '/quota',
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetMailboxesQuery,
  useGetMessagesQuery,
  useGetMessageQuery,
  useLazyGetMessageQuery,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useStarMessageMutation,
  useUnstarMessageMutation,
  useDeleteMessagesMutation,
  useMoveMessagesMutation,
  useCopyMessagesMutation,
  useSearchMessagesQuery,
  useLazySearchMessagesQuery,
  useSendMessageMutation,
  useSaveDraftMutation,
  useUploadAttachmentMutation,
  useDownloadAttachmentQuery,
  useLazyDownloadAttachmentQuery,
  useGetQuotaQuery,
} = mailApi;

// Export endpoints for use in other files
export const {
  getMailboxes,
  getMessages,
  getMessage,
  markAsRead,
  markAsUnread,
  starMessage,
  unstarMessage,
  deleteMessages,
  moveMessages,
  copyMessages,
  searchMessages,
  sendMessage,
  saveDraft,
  uploadAttachment,
  downloadAttachment,
  getQuota,
} = mailApi.endpoints;

export default mailApi;
```

---

## API Integration

### Backend API Consumption

The Mail UI Module consumes the following backend API endpoints (from [SOGo 6 Server Mail Module](../../sogo6-server/.openspec/specs/mail.spec.md)):

#### Folder Endpoints
- `GET /api/user/v1/mail/folders` - List folders
- `POST /api/user/v1/mail/folders` - Create folder
- `GET /api/user/v1/mail/folders/{id}` - Get folder
- `PATCH /api/user/v1/mail/folders/{id}` - Update folder
- `DELETE /api/user/v1/mail/folders/{id}` - Delete folder
- `GET /api/user/v1/mail/folders/{id}/count` - Get message count
- `GET /api/user/v1/mail/folders/{id}/messages` - List messages in folder
- `POST /api/user/v1/mail/folders/{id}/subscribe` - Subscribe
- `POST /api/user/v1/mail/folders/{id}/unsubscribe` - Unsubscribe
- `POST /api/user/v1/mail/folders/{id}/expunge` - Expunge
- `POST /api/user/v1/mail/folders/{id}/purge` - Purge

#### Message Endpoints
- `GET /api/user/v1/mail/messages` - List messages
- `POST /api/user/v1/mail/messages` - Send message
- `GET /api/user/v1/mail/messages/{id}` - Get message
- `PATCH /api/user/v1/mail/messages/{id}` - Update message
- `DELETE /api/user/v1/mail/messages/{id}` - Delete message
- `GET /api/user/v1/mail/messages/{id}/raw` - Get raw message
- `GET /api/user/v1/mail/messages/{id}/download` - Download as .eml
- `POST /api/user/v1/mail/messages/{id}/copy` - Copy message
- `POST /api/user/v1/mail/messages/{id}/move` - Move message
- `POST /api/user/v1/mail/messages/{id}/forward` - Forward
- `POST /api/user/v1/mail/messages/{id}/reply` - Reply
- `POST /api/user/v1/mail/messages/{id}/reply-all` - Reply all
- `GET /api/user/v1/mail/messages/{id}/thread` - Get thread
- `GET /api/user/v1/mail/messages/{id}/attachments` - List attachments

#### Attachment Endpoints
- `POST /api/user/v1/mail/attachments/upload` - Upload attachment
- `GET /api/user/v1/mail/attachments/{id}` - Get attachment
- `DELETE /api/user/v1/mail/attachments/{id}` - Delete attachment

#### Search Endpoints
- `POST /api/user/v1/mail/search` - Search messages
- `GET /api/user/v1/mail/search/saved` - List saved searches
- `POST /api/user/v1/mail/search/saved` - Create saved search
- `DELETE /api/user/v1/mail/search/saved/{id}` - Delete saved search

#### Quota Endpoints
- `GET /api/user/v1/mail/quota` - Get quota
- `GET /api/user/v1/mail/quota/all` - Get all quotas

### Data Transformation

```typescript
// src/app/features/mail/utils/transformers.ts
import { Mailbox, Message } from '../types';

// Transform API mailbox to UI mailbox
export const transformMailbox = (apiMailbox: any): Mailbox => {
  return {
    id: apiMailbox.id,
    name: apiMailbox.name,
    displayName: apiMailbox.display_name || apiMailbox.name,
    type: mapMailboxType(apiMailbox.type),
    path: apiMailbox.path || apiMailbox.name,
    unreadCount: apiMailbox.unread_count || 0,
    totalCount: apiMailbox.total_count || 0,
    starredCount: apiMailbox.starred_count || 0,
    children: apiMailbox.children ? apiMailbox.children.map(transformMailbox) : [],
    isExpanded: false,
    isSelected: false,
  };
};

// Map API mailbox type to UI type
const mapMailboxType = (type: string): Mailbox['type'] => {
  const types: Record<string, Mailbox['type']> = {
    inbox: 'inbox',
    sent: 'sent',
    drafts: 'drafts',
    trash: 'trash',
    junk: 'junk',
    archive: 'archive',
    custom: 'custom',
  };
  return types[type] || 'custom';
};

// Transform API message to UI message
export const transformMessage = (apiMessage: any): Message => {
  return {
    id: apiMessage.id,
    uid: apiMessage.uid,
    msgid: apiMessage.msgid,
    threadId: apiMessage.thread_id || apiMessage.id,
    subject: apiMessage.subject || '(No Subject)',
    from: apiMessage.from_up,
    to: apiMessage.to_addresses || [],
    cc: apiMessage.cc_addresses || [],
    bcc: apiMessage.bcc_addresses || [],
    date: apiMessage.date_received || apiMessage.date,
    dateSent: apiMessage.date_sent || apiMessage.date,
    size: apiMessage.size || 0,
    read: apiMessage.flags?.read !== undefined ? apiMessage.flags.read : !apiMessage.flags?.seen,
    starred: apiMessage.flags?.flagged || false,
    flagged: apiMessage.flags?.flagged || false,
    hasAttachments: apiMessage.has_attachments || false,
    attachmentCount: apiMessage.attachment_count || 0,
    labels: apiMessage.labels || [],
    folderId: apiMessage.folder_id,
    preview: apiMessage.preview || '',
    snippet: apiMessage.snippet || apiMessage.subject || '',
  };
};

// Build mailbox tree from flat list
export const buildMailboxTree = (mailboxes: any[], parentId: string | null = null): Mailbox[] => {
  return mailboxes
    .filter(m => m.parent_id === parentId)
    .map(mailbox => ({
      ...transformMailbox(mailbox),
      children: buildMailboxTree(mailboxes, mailbox.id),
    }));
};

// Flatten mailbox tree
export const flattenMailboxTree = (tree: Mailbox[]): Mailbox[] => {
  return tree.reduce<Mailbox[]>((acc, mailbox) => {
    acc.push(mailbox);
    if (mailbox.children.length > 0) {
      acc.push(...flattenMailboxTree(mailbox.children));
    }
    return acc;
  }, []);
};

// Find mailbox by ID in tree
export const findMailboxInTree = (tree: Mailbox[], id: string): Mailbox | null => {
  for (const mailbox of tree) {
    if (mailbox.id === id) return mailbox;
    if (mailbox.children.length > 0) {
      const found = findMailboxInTree(mailbox.children, id);
      if (found) return found;
    }
  }
  return null;
};
```

---

## UI Components

### Feature Entry Point

```typescript
// src/app/features/mail/MailFeature.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import MailLayout from './components/MailLayout/MailLayout';

// Lazy load sub-components
const MailList = lazy(() => import('./components/MailList/MailList'));
const MailDetail = lazy(() => import('./components/MailDetail/MailDetail'));
const MailCompose = lazy(() => import('./components/MailCompose/MailCompose'));
const MailboxSettings = lazy(() => import('./components/MailboxSettings/MailboxSettingsDialog'));

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100%">
    <CircularProgress />
  </Box>
);

const MailFeature = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>