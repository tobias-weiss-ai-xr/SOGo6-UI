# Translation Guide for SOGo6 UI

This document provides guidance for translators contributing to SOGo6 UI localization.

## Supported Locales

### Existing (5)
- **en** - English (default)
- **de** - German
- **fr** - French
- **es** - Spanish
- **zh** - Chinese (Simplified)

### European (14 new)
- **it** - Italian
- **pt** - Portuguese
- **nl** - Dutch
- **pl** - Polish
- **ru** - Russian
- **sv** - Swedish
- **da** - Danish
- **fi** - Finnish
- **no** - Norwegian
- **cs** - Czech
- **el** - Greek
- **tr** - Turkish
- **hu** - Hungarian
- **ro** - Romanian

### Global (7 new)
- **ja** - Japanese
- **hi** - Hindi
- **ar** - Arabic
- **ko** - Korean
- **th** - Thai
- **vi** - Vietnamese
- **id** - Indonesian

## File Structure

Translations are organized by feature/module:

```
src/messages/<locale>/
├── a11y.json              # Accessibility labels
├── auth.json              # Authentication & login
├── calendars.json         # Calendar features
├── commons.json           # Common/shared strings
├── header.json            # Header/navigation
├── navigation.json        # Navigation menu
├── notifications.json     # Notification messages
├── tasks.json             # Task management
├── search.json            # Search functionality
├── opencloud.json         # Cloud storage
├── portal.json            # Portal features
├── address-books/         # Contact management
├── admin-panel/           # Administration features
├── components/            # Reusable UI components
├── forms/                 # Form labels & validation
├── mails/                 # Email features
└── user-settings/         # User preferences
```

## Translation Format

All files use JSON format with nested keys:

```json
{
  "SECTION": {
    "key": {
      "string": "Translated text"
    },
    "anotherKey": {
      "title": {
        "string": "Title text"
      },
      "description": {
        "string": "Description text"
      }
    }
  }
}
```

## Guidelines

### 1. Keep Structure Intact
- **DO NOT** change the JSON structure or key names
- **DO** only translate the `"string"` values
- Keep all nested objects and arrays as-is

### 2. Context Matters
- Check the English version for context
- Some strings may have `title`, `description`, `label`, `placeholder` sub-keys
- Translate each appropriately for its purpose

### 3. Special Characters
- Preserve HTML entities (`&nbsp;`, `&amp;`, etc.)
- Keep variable placeholders like `{0}`, `{name}`, `{{count}}`
- Maintain line breaks (`\n`) where present

### 4. Length Considerations
- Some languages are longer than English (German, Finnish)
- Some are shorter (Chinese, Japanese)
- Try to keep similar length when possible for UI consistency

### 5. Technical Terms
- Keep product names (SOGo, Nextcloud, etc.) in English
- Translate feature names consistently
- Use established terminology for your language

### 6. Gender & Formality
- Consider your language's gender rules
- Choose appropriate formality level (formal vs. informal)
- Be consistent throughout all files

## Workflow

### For Translators

1. **Fork/Clone** the repository
2. **Navigate** to your locale: `src/messages/<locale>/`
3. **Copy** English files if starting fresh (already done for new locales)
4. **Translate** each JSON file
5. **Test** locally: `npm run dev`
6. **Submit** pull request

### Testing Your Translations

```bash
# Navigate to UI directory
cd sogo6-ui

# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Access with your locale: http://localhost:3000/<locale>/
# Example: http://localhost:3000/de/ for German
```

### Validation

After translating, run the translation checker:

```bash
node scripts/check-translation-keys.js
```

This will:
- Verify all keys match English version
- Check for missing translations
- Report structural differences

## Adding New Translation Keys

If you add new features that require new translation keys:

1. **Add to English first** (`src/messages/en/`)
2. **Add to all locales** (or mark as TODO)
3. **Update compiled messages**: `node scripts/compile-messages.mjs`

## Tools & Resources

- **next-intl**: https://next-intl-docs.vercel.app
- **Date-fns locales**: Automatically handled in `src/lib/i18n/date-locales.ts`
- **RTL Support**: Arabic (ar) requires right-to-left layout support

## Questions?

Contact the development team or open an issue for:
- Clarification on string context
- Technical translation questions
- Missing keys or structural issues

## Thank You!

Your contributions make SOGo6 accessible to users worldwide! 🌍
