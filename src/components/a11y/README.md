# SOGo 6 Accessibility Components

This directory contains accessibility-focused React components and utilities for SOGo 6, designed to help meet WCAG 2.1 AA and AAA standards.

## 📋 Purpose

These components address the accessibility gaps identified in the SOGo 6 Features Deep Dive, specifically:

- **WCAG Compliance**: Provides tools to meet Level AA and AAA requirements
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and live announcements
- **Focus Management**: Consistent focus indication and trap management
- **Bypass Blocks**: Skip links to bypass repeated content (WCAG 2.4.1)
- **Focus Order**: Logical keyboard navigation order (WCAG 2.4.3)
- **Focus Visible**: Clear focus indicators (WCAG 2.4.7)
- **Target Size**: Appropriate touch target sizes (WCAG 2.5.5)

## 🚀 Installation & Usage

### Automatic Installation

All accessibility components are automatically available when you import from `@/components/a11y`:

```typescript
import {
  SkipLink,
  VisuallyHidden,
  FocusTrap,
  useLiveAnnouncer,
  ErrorBoundary
} from '@/components/a11y';
```

### In Your Application Root

Add the `LiveAnnouncerProvider` to your application's root:

```tsx
// app/layout.tsx or _app.tsx
import { LiveAnnouncerProvider } from '@/components/a11y';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LiveAnnouncerProvider>
          <DefaultSkipLinks />
          {children}
        </LiveAnnouncerProvider>
      </body>
    </html>
  );
}
```

## 📚 Available Components

### 🎯 SkipLink (`SkipLink.tsx`)

Bypasses repeated content blocks for keyboard users (WCAG 2.4.1).

```tsx
// Single skip link
<SkipLink targetId="main" />

// Multiple skip links
<SkipLinks links={[
  { targetId: 'main' },
  { targetId: 'navigation' },
]} />

// Default skip links (main + navigation)
<DefaultSkipLinks />
```

### 👁️ VisuallyHidden (`VisuallyHidden.tsx`)

Hides content visually while keeping it accessible to screen readers.

```tsx
// Basic usage
<VisuallyHidden>Screen reader only text</VisuallyHidden>

// For icon buttons
<AccessibleIcon icon={<SearchIcon />} label="Search" />

// Combined with icons
<IconLabel icon={<SettingsIcon />} label="Settings" />
```

### 🔒 FocusTrap (`FocusTrap.tsx`)

Traps keyboard focus within a container, useful for modals and dialogs.

```tsx
// Basic focus trap
<FocusTrap active={isModalOpen}>
  <ModalContent />
</FocusTrap>

// Modal with automatic outside click handling
<ModalFocusTrap
  active={isModalOpen}
  onOutsideClick={() => setIsModalOpen(false)}
>
  <ModalContent />
</ModalFocusTrap>

// Programmatic control
const ref = useRef<HTMLDivElement>(null);
useFocusTrap(ref, { active: isOpen });
```

### 🔊 LiveAnnouncer (`LiveAnnouncer.tsx`)

Announces dynamic content changes to screen reader users.

```tsx
// In a component
const { announce } = useLiveAnnouncer();

// Announce messages
grid.props.onSelectionChange = (selected) => {
  announce(`${selected.length} items selected`, 'POLITE');
};

// Use hook for common announcements
const { announceFormState } = useAnnounce();
announceFormState('success', 'Contact Form');

// Loading state announcements
<LoadingAnnouncer 
  isLoading={isLoading}
  hasError={hasError}
  hasSuccess={hasSuccess}
/>

// Route change announcements
<RouteAnnouncer path={router.pathname} title={pageTitle} />

// Notification announcements
<NotificationAnnouncer notifications={notifications} />
```

### ⌨️ KeyboardNavigator (`KeyboardNavigator.tsx`)

Provides keyboard navigation for lists, grids, and tabs.

```tsx
// List navigation
<KeyboardListNavigator
  selectedIndex={selectedIndex}
  itemCount={items.length}
  onSelectionChange={setSelectedIndex}
  onSelect={(index) => selectItem(index)}
  circular={true}
  orientation="vertical"
>
  {items.map((item, index) => (
    <ListItem key={index}>{item}</ListItem>
  ))}
</KeyboardListNavigator>

// Grid navigation
<KeyboardGridNavigator
  position={{ row: 0, col: 0 }}
  dimensions={{ rows: 3, cols: 3 }}
  onPositionChange={setPosition}
/>

// Tab navigation
<KeyboardTabList selectedIndex={activeTab} onChange={setActiveTab}>
  <button role="tab">Tab 1</button>
  <button role="tab">Tab 2</button>
</KeyboardTabList>

// Keyboard shortcuts
useKeyboardShortcut('Ctrl+S', () => save());
useKeyboardShortcut('Ctrl+Z', () => undo());
```

### 🛡️ ErrorBoundary (`ErrorBoundary.tsx`)

Accessible error boundaries that announce errors to screen readers.

```tsx
// Basic usage
<ErrorBoundary>
  <UnstableComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary 
  fallback={<CustomErrorFallback />}
  onError={(error, info) => logError(error, info)}
>
  <UnstableComponent />
</ErrorBoundary>

// With higher-order component
const SafeComponent = withErrorBoundary(UnstableComponent);

// Accessible error fallback
<AccessibleErrorFallback
  error={error}
  title="Loading Error"
  message="Failed to load data"
  onRetry={fetchData}
  onSupport={openSupport}
/>
```

## 🎨 CSS & Styling

All accessibility styles are added to `src/app/globals.css`:

- **Skip Links**: Hidden until focused
- **Focus Indicators**: `:focus-visible` styles for keyboard navigation
- **Visually Hidden**: `.visually-hidden` and `.sr-only` classes
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Respects `prefers-contrast`
- **Forced Colors**: Windows High Contrast Mode support
- **Touch Targets**: Minimum 44px for mobile accessibility
- **Print Styles**: Removes non-essential content

### Customizing Styles

Override styles in your components using CSS variables:

```css
:root {
  /* Focus styles */
  --focus-width: 3px;
  --focus-color: hsl(var(--primary));
  --focus-offset: 2px;
}

:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}
```

## ✅ WCAG Compliance Checklist

### ✅ Implemented Features

- [x] **2.4.1 Bypass Blocks** - Skip links for navigation
- [x] **2.4.3 Focus Order** - Logical keyboard navigation
- [x] **2.4.7 Focus Visible** - Clear focus indicators
- [x] **2.5.5 Target Size** - Appropriate touch targets
- [x] **4.1.2 Name, Role, Value** - Proper ARIA attributes
- [x] **4.1.3 Status Messages** - Live announcements

### 🎯 Partially Implemented

- [ ] **2.4.6 Headings and Labels** - Consistent heading hierarchy
- [ ] **3.1.1 Language of Page** - Page language detection
- [ ] **3.2.1 On Focus** - No unexpected context changes
- [ ] **3.2.2 On Input** - No unexpected context changes
- [ ] **3.3.2 Labels or Instructions** - Clear form labels

### 📝 To Be Implemented

- [ ] **2.4.2 Page Titled** - Descriptive page titles
- [ ] **2.4.4 Link Purpose** - Clear link descriptions
- [ ] **2.4.5 Multiple Ways** - Multiple navigation methods
- [ ] **3.1.2 Language of Parts** - Language attributes for foreign content
- [ ] **3.3.3 Error Suggestion** - Suggestions for form errors
- [ ] **3.3.4 Error Prevention** - Confirmation for critical actions

## 🔧 Configuration

### Constants (`src/lib/accessibility/constants.ts`)

```typescript
import { ARIA_LIVE_REGIONS, KEYBOARD_KEYS } from '@/lib/accessibility/constants';

ARIA_LIVE_REGIONS.POLITE  // 'polite'
ARIA_LIVE_REGIONS.ASSERTIVE  // 'assertive'

KEYBOARD_KEYS.TAB  // 'Tab'
KEYBOARD_KEYS.ENTER  // 'Enter'
KEYBOARD_KEYS.ESCAPE  // 'Escape'
```

### Utilities (`src/lib/accessibility/utils.ts`)

```typescript
import {
  isFocusable,
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
  trapFocus,
  releaseFocus,
  createVisuallyHiddenStyle,
  generateAriaLabel,
  generateId
} from '@/lib/accessibility/utils';
```

## 🧪 Testing

All accessibility components include comprehensive tests:

```bash
# Run accessibility tests
npm test -- --testPathPattern="a11y"

# Run all tests
npm test
```

### Test Files

- `src/components/a11y/__tests__/SkipLink.test.tsx`
- `src/components/a11y/__tests__/VisuallyHidden.test.tsx`
- `src/components/a11y/__tests__/FocusTrap.test.tsx`
- `src/components/a11y/__tests__/LiveAnnouncer.test.tsx`
- `src/components/a11y/__tests__/KeyboardNavigator.test.tsx`
- `src/components/a11y/__tests__/ErrorBoundary.test.tsx`

### Manual Testing Tools

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Readers**: Test with VoiceOver, JAWS, NVDA
3. **Browser Tools**: Chrome DevTools Accessibility Panel
4. **Automated Tools**: axe-core, Lighthouse

```bash
# Install axe-core
npm install @axe-core/react

# Run automated accessibility tests
import { axe } from '@axe-core/react';
```

## 🌍 Internationalization

Accessibility messages are available in multiple languages via `next-intl`:

```typescript
// src/messages/en/a11y.json
{
  "skip_to_main_content": "Skip to main content",
  "skip_to_navigation": "Skip to navigation",
  "loading": "Loading...",
  "something_went_wrong": "Something went wrong",
  "try_again": "Try again"
}
```

To add translations for a new language:

1. Create a new file: `src/messages/{locale}/a11y.json`
2. Translate all strings
3. Import in your page/layout:

```tsx
import { NextIntlClientProvider } from 'next-intl';

// Load messages
const messages = await import(`../messages/${locale}/a11y.json`);
```

## 📄 Documentation

- [SOGo 6 Development Status](../../../../docs/SOGO6-DEVELOPMENT-STATUS.md)
- [SOGo 6 Features Deep Dive](../../../../docs/SOGO6-FEATURES-DEEP-DIVE.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## 🤝 Contributing

When adding new components or features:

1. **Accessibility First**: Consider accessibility from the beginning
2. **Follow WCAG**: Use WCAG 2.1 AA as the minimum standard
3. **Add Tests**: Include accessibility tests for new components
4. **Document**: Update this README with new features
5. **Internationalize**: Add translations for new messages

### Contribution Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] All images and icons have appropriate text alternatives
- [ ] Form fields have proper labels
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG requirements (4.5:1 for text)
- [ ] ARIA attributes are used correctly
- [ ] Screen reader testing completed
- [ ] Keyboard navigation testing completed
- [ ] Responsive design testing completed

## 🐛 Reporting Issues

When reporting accessibility issues:

1. **Describe the issue**: What's the accessibility problem?
2. **Steps to reproduce**: How can we see the issue?
3. **Expected behavior**: What should happen instead?
4. **Affected users**: Which assistive technologies are affected?
5. **WCAG requirement**: Which WCAG criteria does this violate?
6. **Severity**: Critical/High/Medium/Low

## 🎯 Next Steps

To complete WCAG 2.1 AA compliance:

1. **Audit**: Use automated tools to scan for issues
2. **Manual Testing**: Test with screen readers and keyboard navigation
3. **Fix**: Address identified issues using these components
4. **Test**: Verify fixes with users of assistive technologies
5. **Monitor**: Regularly audit for new accessibility issues

### Immediate Action Items

1. Add skip links to all page layouts
2. Ensure all interactive elements have focus styles
3. Add live announcements for dynamic content
4. Implement proper form validation and error messaging
5. Test color contrast across all themes

## 📊 Metrics

- **Current Compliance**: Partial WCAG 2.1 AA
- **Target Compliance**: Full WCAG 2.1 AA
- **Components Created**: 6 major accessibility components
- **WCAG Criteria Met**: 6 out of 25 (Level A/AA)
- **Automated Test Coverage**: 100% of accessibility components

## 🔗 Related Files

- `src/lib/accessibility/constants.ts` - Accessibility constants
- `src/lib/accessibility/utils.ts` - Accessibility utilities
- `src/app/globals.css` - Global accessibility styles
- `src/messages/en/a11y.json` - Accessibility translations
- `src/components/Layout.tsx` - Layout with skip links

## 🏆 Recognition

This accessibility implementation is based on best practices from:

- [W3C Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Accessibility Patterns](https://reactjs.org/docs/accessibility.html)
- [Inclusive Components](https://inclusive-components.design/)

---

**Maintained by:** SOGo 6 Development Team  
**License:** AGPL-3.0  
**WCAG Version:** 2.1 Level AA  
**Last Updated:** July 2026
