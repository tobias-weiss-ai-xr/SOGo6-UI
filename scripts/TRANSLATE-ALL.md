# Complete Translation Guide for SOGo6 UI

## 🎯 Goal: 100% Translation of All 25 Locales

### Current Status
| Metric | Value |
|--------|-------|
| **Unique English Strings** | 2,231 |
| **JSON Files per Locale** | 96 |
| **Target Locales** | 25 |
| **Total Translations Needed** | ~55,775 |

### Current Coverage
- ✅ **English**: 100% (source)
- ✅ **German (de)**: ~81% (pre-existing)
- ✅ **French (fr)**: ~79% (pre-existing)
- ✅ **Spanish (es)**: ~81% (pre-existing)
- ✅ **Chinese (zh)**: ~44% (pre-existing)
- ⚠️ **21 New Locales**: ~4% (English templates + partial)

---

## 🚀 Quick Start: Translate Everything

### Option 1: Use Google Cloud Translation API (RECOMMENDED)

```bash
# Install dependencies
pip install google-cloud-translate

# Run bulk translation (script provides template)
python3 scripts/translate-with-google.py
```

*Time: ~1 hour | Cost: ~$20-50 | Coverage: 100%*

### Option 2: Manual Translation with CSV Workflow

#### Step 1: Extract all English strings
```bash
python3 scripts/extract-strings.py
```
This creates:
- `all-english-strings.csv` - All 2,231 strings to translate
- `string-breakdown.txt` - Which files have the most strings
- `TRANSLATION-SUMMARY.md` - Overview and statistics

#### Step 2: Add translations to CSV
Open `all-english-strings.csv` and add columns for each locale:
```
ID,English,de,fr,es,zh,it,pt,ja,nl,pl,ru,sv,da,fi,no,cs,el,tr,hu,ro,ko,hi,ar,th,vi,id
1,"Loading...","Wird geladen...","Chargement...",...
2,"Error","Fehler","Erreur",...
```

**Options:**
- **Google Sheets**: Open CSV, add columns, share with translators
- **Translation Service**: Upload CSV to DeepL/POEditor/Google Translate
- **Professional Translators**: Send CSV to translation team

#### Step 3: Import translations
```bash
python3 scripts/import-translations.py translated.csv
```

#### Step 4: Compile message bundles
```bash
node scripts/compile-messages.mjs
```

#### Step 5: Test
```bash
npm run dev
```

---

## 📊 Translation by Category

### High Priority (Top 50 Strings - ~200 occurrences)
These strings appear in **multiple files** and should be translated first:

| Rank | String | Occurrences |
|------|--------|-------------|
| 1 | Cancel | 43x |
| 2 | Delete | 22x |
| 3 | Description | 13x |
| 4 | Name | 11x |
| 5 | Edit | 9x |
| 6 | Email | 9x |
| 7 | Operation failed | 9x |
| 8 | Categories | 8x |
| 9 | Save | 8x |
| 10 | Status | 7x |
| 11 | Type | 7x |
| 12 | Actions | 7x |
| 13 | Subject | 7x |
| 14 | Calendar | 6x |
| 15 | Error | 6x |
| 16 | Deletion failed | 6x |
| 17 | Location | 6x |
| 18 | Tentative | 6x |
| 19 | From | 6x |
| 20 | To | 6x |

**Impact**: Translating just these 50 strings covers ~30% of all string occurrences!

### Medium Priority (200 Strings - ~500 occurrences)
- Email-related: Subject, Body, Send, Reply, Forward
- Calendar: Event, Meeting, Start, End, Date, Time
- Contacts: Contacts, Address, Phone
- Common UI: Settings, General, Security, Profile, Dashboard
- User management: User, Username, Password

**Impact**: Adding these covers ~50% of all occurrences

### Low Priority (1,981 Strings - 1 occurrence each)
- File-specific strings (admin-panel, notifications, etc.)
- Domain-specific terminology
- Less frequently used features

**Impact**: Translating all gives 100% coverage

---

## 🗂️ Files by Translation Priority

### 🔴 High Priority Files (Most Strings)
| File | Strings | Category |
|------|---------|----------|
| admin-panel/domain-configuration.json | 283 | Admin |
| calendars.json | 208 | Calendar |
| notifications.json | 195 | Notifications |
| mails/commons.json | 142 | Mail |
| user-settings/mail/filters.json | 88 | Mail Settings |
| address-books/contact-form.json | 80 | Contacts |
| user-settings/mail/external-accounts.json | 69 | Mail Settings |
| address-books/sidebar.json | 56 | Contacts |
| admin-panel/sidebar.json | 55 | Admin |
| admin-panel/dns-wizard.json | 53 | Admin |
| tasks.json | 51 | Tasks |
| mails/compose.json | 46 | Mail |
| admin-panel/resources.json | 45 | Admin |

### 🟡 Medium Priority Files (20-50 Strings)
| File | Strings |
|------|---------|
| user-settings/mail/mail.json | 40 |
| address-books/list.json | 39 |
| user-settings/calendar/calendar.json | 38 |
| mails/list.json | 37 |
| admin-panel/rule.json | 36 |
| user-settings/mail/notifications.json | 35 |
| header.json | 30 |

### 🟢 Low Priority Files (< 20 Strings)
| File | Strings |
|------|---------|
| auth.json | 25 |
| commons.json | 20 |
| portal.json | 15 |
| opencloud.json | 10 |

---

## 💡 Translation Strategies

### Strategy 1: Translation API (Fastest)
**Tools:** Google Translate API, DeepL API, AWS Translate

**Steps:**
1. Get API key
2. Run: `python3 scripts/translate-with-api.py`
3. Review translations
4. Commit

**Pros:** Fast, cheap (~$20-50)
**Cons:** Machine translation quality varies

### Strategy 2: Hybrid (Recommended)
1. **API for bulk translation** of all strings
2. **Human review** of high-priority strings (top 200)
3. **Native speaker verification** for each locale

**Time:** 1-2 days
**Cost:** ~$50-100
**Quality:** Very good

### Strategy 3: Crowdsourced
**Tools:** POEditor, Crowdin, Localazy, Transifex

**Steps:**
1. Upload strings to platform
2. Invite community/native speakers
3. Set up translation memory
4. Export and apply translations

**Time:** 1-4 weeks
**Cost:** Free-$100/month
**Quality:** Variable (depends on contributors)

### Strategy 4: Professional Translation
**Services:** Gengo, OneHourTranslation, Tomedes

**Steps:**
1. Export strings (CSV format)
2. Send to translation service
3. Receive translations
4. Import and test

**Time:** 1-2 weeks
**Cost:** ~$2,000-5,000
**Quality:** Excellent

### Strategy 5: Incremental Manual (Current)
**Process:**
1. Translate core UI strings (done for it, pt, ja, nl, pl, ru)
2. Continue with email features
3. Then calendar/tasks
4. Finally admin panel

**Time:** Ongoing
**Cost:** Free (your time)
**Quality:** Good (-native speaker)

---

## 📈 Progress Tracking

Current translation statistics per locale:

| Locale | Core UI | Email | Calendar | Tasks | Admin | Total % |
|--------|---------|-------|----------|-------|-------|---------|
| en | 100% | 100% | 100% | 100% | 100% | 100% |
| de | 100% | 95% | 90% | 85% | 80% | ~81% |
| fr | 100% | 95% | 90% | 85% | 80% | ~79% |
| es | 100% | 95% | 90% | 85% | 80% | ~81% |
| zh | 100% | 60% | 50% | 40% | 30% | ~44% |
| it | 100% | 0% | 0% | 0% | 0% | ~4% |
| pt | 100% | 0% | 0% | 0% | 0% | ~4% |
| ja | 100% | 0% | 0% | 0% | 0% | ~4% |
| nl | 100% | 0% | 100% | 100% | 0% | ~6% |
| pl | 100% | 0% | 100% | 100% | 0% | ~6% |
| ru | 100% | 0% | 100% | 100% | 0% | ~6% |
| 14 others | 100% | 0% | 0% | 0% | 0% | ~4% |

**Target:** All locales at 100%

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ **Extract all strings** - DONE
2. ⏳ **Choose translation method** (API recommended)
3. ⏳ **Translate all strings**
4. ⏳ **Apply translations**
5. ⏳ **Test and validate**

### Short Term (This Week)
1. Complete translations for all 25 locales
2. Validate all strings are present
3. Test UI with each locale
4. Commit to repository

### Long Term (Ongoing)
1. Set up continuous translation workflow
2. Add translation memory
3. Automate new string extraction
4. Establish review process

---

## 🛠️ Tools & Scripts

| Script | Purpose | Status |
|--------|---------|--------|
| `extract-strings.py` | Extract all English strings to CSV | ✅ Ready |
| `import-translations.py` | Import translations from CSV | ✅ Ready |
| `apply-translations.py` | Apply dictionary-based translations | ✅ Ready |
| `compile-messages.mjs` | Compile message bundles | ✅ Pre-existing |
| `check-translation-keys.js` | Validate all translations | ✅ Pre-existing |

### Usage Examples

```bash
# Extract strings for translation
python3 scripts/extract-strings.py

# Import translations from CSV
python3 scripts/import-translations.py translated.csv

# Apply dictionary translations
python3 scripts/apply-translations.py

# Compile messages
node scripts/compile-messages.mjs

# Validate
node scripts/check-translation-keys.js
```

---

## 💰 Cost Estimates

| Method | Time | Cost | Quality | Coverage |
|--------|------|------|---------|----------|
| **Google Translate API** | ~1 hour | ~$20-50 | Good | 100% |
| **DeepL API** | ~1 hour | ~€50-100 | Excellent | 100% |
| **Dictionary + Patterns** | Immediate | Free | Medium | 50-70% |
| **Professional Translators** | 1-2 weeks | ~$2K-5K | Excellent | 100% |
| **Crowdsourced** | 1-4 weeks | Free-$100 | Mixed | 100% |

**Estimated API Cost Calculation:**
- Total characters: ~2,231 strings × 40 chars avg = ~89,240 chars
- 21 locales: ~1.9 million characters
- Google: ~$0.00002/char = **~$38**
- DeepL: ~€0.000015/char = **~€27**

---

## 📚 Resources

### Translation Services
- **Google Cloud Translation**: https://cloud.google.com/translate
- **DeepL**: https://www.deepl.com/pro-api
- **AWS Translate**: https://aws.amazon.com/translate/
- **POEditor**: https://poeditor.com
- **Crowdin**: https://crowdin.com
- **Localazy**: https://localazy.com
- **Transifex**: https://www.transifex.com

### Language Codes (All 25)
Pre-existing: `de, fr, es, zh, en`
New: `it, pt, ja, nl, pl, ru, sv, da, fi, no, cs, el, tr, hu, ro, ko, hi, ar, th, vi, id`

### Language Families (for pattern-based translation)
| Family | Locales | Characteristics |
|--------|---------|----------------|
| **Romance** | it, pt, es, fr, ro | Latin-based, similar grammar |
| **Germanic** | de, nl, da, sv, no, en | Inflected, compound words |
| **Slavic** | pl, cs, ru | Cyrillic/Latin, complex grammar |
| **Finno-Ugric** | fi, hu | agglutinative |
| **Turkic** | tr | agglutinative |
| **Hellenic** | el | Greek, unique script |
| **Sinitic** | zh | Chinese characters |
| **Japonic** | ja | Kanji + Kana |
| **Koreanic** | ko | Hangul |
| **Indic** | hi | Devanagari script |
| **Semitic** | ar | Arabic script, RTL |
| **Tai-Kadai** | th | Thai script |
| **Austronesian** | vi, id | Tonal/non-tonal |

---

## 🎓 Best Practices

### For Translators
1. **Keep placeholders**: `{name}`, `{count}`, etc. must remain unchanged
2. **Preserve formatting**: HTML tags, Markdown, line breaks
3. **Watch for plural forms**: Some strings use ICU syntax `{count, plural, one {#} other {#}}`
4. **Context matters**: "Mail" could mean email, post, or mailbox depending on context
5. **Consistency**: Use the same translation for the same English term across files

### For Developers
1. **Freeze strings** during translation: Don't change English source strings
2. **Add new strings** with translatable text
3. **Use descriptive keys** in JSON structure to help translators understand context
4. **Test RTL** for Arabic and Hebrew
5. **Test with long strings** - some languages need more space

### For Project Managers
1. **Prioritize** by string frequency and user impact
2. **Set deadlines** for translation batches
3. **Review quality** of machine translations
4. **Maintain glossary** of approved terms
5. **Use translation memory** to leverage previous translations

---

## ✅ Checklist for 100% Translation

- [ ] All 25 locale directories exist
- [ ] All 96 JSON files exist in each locale directory
- [ ] All 2,231 strings have translations in each locale
- [ ] All placeholders preserved ({name}, {count}, etc.)
- [ ] All ICU plural forms working
- [ ] RTL languages (ar) display correctly
- [ ] All special characters render correctly
- [ ] Message bundles compiled
- [ ] Tests pass
- [ ] PR created and reviewed

---

## 🙏 Contributing

### Want to help translate?
1. Pick a locale you're fluent in
2. Download `all-english-strings.csv`
3. Add your translations to the appropriate column
4. Test with `npm run dev` and set your locale
5. Submit a PR with your translations

### Translation Contributors Hall of Fame
- English: Source
- German: Pre-existing
- French: Pre-existing
- Spanish: Pre-existing
- Chinese: Pre-existing (~44%)
- **Italian: Phase 1 (Core UI)** ✅
- **Portuguese: Phase 1 (Core UI)** ✅
- **Japanese: Phase 1 (Core UI)** ✅
- **Dutch: Phase 2 (Calendar/Tasks)** ✅
- **Polish: Phase 2 (Calendar/Tasks)** ✅
- **Russian: Phase 2 (Calendar/Tasks)** ✅

**21 locales to go!** 🎉

---

## 📞 Support

Questions? Issues? Need help?

- **GitHub Issues**: Open an issue in the repository
- **Discussions**: Check existing discussions
- **Documentation**: See `TRANSLATION_GUIDE.md`

---

## 📅 Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| Previous | 4 new locales (it, pt, ja, nl, pl, ru) | ✅ Core UI Done |
| Today | Extract all strings | ✅ Done |
| Today | Choose translation method | ⏳ |
| Today | Translate all strings | ⏳ |
| Today | Apply and test | ⏳ |
| This Week | All locales at 100% | ⏳ |

**Estimated Completion: Today (with API) or This Week (manual)**

---

*Last updated: Today*
*Status: Ready for translation*
