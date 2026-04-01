# Spec-Driven Development Prompt: "Bun Everywhere" Chrome Extension

---

```
You are an expert Chrome Extension developer. Implement the "Bun Everywhere" Chrome Extension 
from scratch based on the following complete specification. Follow every requirement precisely. 
Do not skip any file. Output all files with their full content.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROJECT OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Bun Everywhere" is a Chrome Extension (Manifest V3) that automatically replaces 
npm/yarn/pnpm/npx commands found in web page code blocks with their Bun equivalents,
wherever Bun is a fully compatible drop-in replacement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## FILE STRUCTURE (generate ALL of these)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bun-everywhere/
├── manifest.json
├── background.js
├── content.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── settings/
│   ├── settings.html
│   ├── settings.js
│   └── settings.css
├── icons/
│   ├── icon16.png        (generate as inline SVG-based data URI or use canvas in a generator script — describe how to generate them)
│   ├── icon48.png
│   └── icon128.png
├── rules/
│   └── replacements.js   (the central command replacement map)
├── README.md
├── PRIVACY_POLICY.md
└── .agents.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 1 — manifest.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Manifest Version: 3
- Name: "Bun Everywhere"
- Version: "1.0.0"
- Description: "Replaces npm/yarn/pnpm commands with Bun equivalents on any webpage."
- Permissions: ["storage", "activeTab", "scripting"]
- Host permissions: ["<all_urls>"]
- background: service_worker → background.js
- content_scripts:
    - matches: ["<all_urls>"]
    - js: ["content.js"]
    - run_at: "document_idle"
- action:
    - default_popup: popup/popup.html
    - default_icon: icons/
- options_page: settings/settings.html
- icons: 16, 48, 128

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 2 — COMMAND REPLACEMENT RULES (rules/replacements.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Export a `PROVIDERS` object and a `REPLACEMENTS` map.

### PROVIDERS (each can be toggled on/off by the user):
- "npm"
- "yarn"
- "pnpm"
- "npx"
- "yarn dlx"
- "pnpm dlx"

### REPLACEMENT RULES (implement ALL of these as regex-based transformations):

**npm → bun:**
| Input Pattern                          | Output                        |
|----------------------------------------|-------------------------------|
| npm install                            | bun install                   |
| npm i                                  | bun install                   |
| npm install <pkg>                      | bun add <pkg>                 |
| npm install --save-dev <pkg>           | bun add --dev <pkg>           |
| npm install -D <pkg>                   | bun add --dev <pkg>           |
| npm install --global <pkg>             | bun add --global <pkg>        |
| npm install -g <pkg>                   | bun add --global <pkg>        |
| npm uninstall <pkg>                    | bun remove <pkg>              |
| npm run <script>                       | bun run <script>              |
| npm test                               | bun test                      |
| npm start                              | bun start                     |
| npm publish                            | bun publish                   |
| npm init                               | bun init                      |
| npm create <template>                  | bun create <template>         |
| npm update                             | bun update                    |
| npm outdated                           | (skip — no bun equivalent)    |
| npm audit                              | (skip — no bun equivalent)    |
| npm ci                                 | bun install --frozen-lockfile |

**npx → bunx:**
| Input Pattern                          | Output                        |
|----------------------------------------|-------------------------------|
| npx <anything>                         | bunx <anything>               |

**yarn → bun:**
| Input Pattern                          | Output                        |
|----------------------------------------|-------------------------------|
| yarn                                   | bun install                   |
| yarn install                           | bun install                   |
| yarn add <pkg>                         | bun add <pkg>                 |
| yarn add --dev <pkg>                   | bun add --dev <pkg>           |
| yarn add -D <pkg>                      | bun add --dev <pkg>           |
| yarn global add <pkg>                  | bun add --global <pkg>        |
| yarn remove <pkg>                      | bun remove <pkg>              |
| yarn run <script>                      | bun run <script>              |
| yarn test                              | bun test                      |
| yarn start                             | bun start                     |
| yarn build                             | bun run build                 |
| yarn dlx <pkg>                         | bunx <pkg>                    |
| yarn create <template>                 | bun create <template>         |
| yarn upgrade                           | bun update                    |
| yarn init                              | bun init                      |

**pnpm → bun:**
| Input Pattern                          | Output                        |
|----------------------------------------|-------------------------------|
| pnpm install                           | bun install                   |
| pnpm i                                 | bun install                   |
| pnpm add <pkg>                         | bun add <pkg>                 |
| pnpm add --save-dev <pkg>              | bun add --dev <pkg>           |
| pnpm add -D <pkg>                      | bun add --dev <pkg>           |
| pnpm add --global <pkg>               | bun add --global <pkg>        |
| pnpm add -g <pkg>                      | bun add --global <pkg>        |
| pnpm remove <pkg>                      | bun remove <pkg>              |
| pnpm run <script>                      | bun run <script>              |
| pnpm test                              | bun test                      |
| pnpm start                             | bun start                     |
| pnpm dlx <pkg>                         | bunx <pkg>                    |
| pnpm create <template>                 | bun create <template>         |
| pnpm update                            | bun update                    |
| pnpm init                              | bun init                      |
| pnpm exec <cmd>                        | bunx <cmd>                    |

### IMPLEMENTATION NOTES FOR REPLACEMENTS:
- Apply replacements using an **ordered array of rule objects**, each with:
  { provider: string, pattern: RegExp, replacement: string | Function, bunCompatible: true }
- Rules must match at **word boundaries** and be **case-sensitive** (bun commands are lowercase).
- Replacements must only apply inside recognized code elements (see Spec 3).
- Replacements that have no Bun equivalent must be explicitly listed but skipped 
  (marked as `bunCompatible: false`) so the system never replaces them.
- Export the rules so both content.js and settings.js can import/read them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 3 — content.js (Content Script)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Behavior:
1. On page load, read settings from chrome.storage.sync.
2. If the extension is globally OFF, do nothing.
3. If the current page's hostname matches any entry in the user's excludedSites list, do nothing.
4. Scan the DOM for code elements and apply replacements for all enabled providers.
5. Observe DOM mutations (MutationObserver) for dynamically injected code blocks and apply 
   replacements to new nodes as well.
6. Listen for messages from background.js (toggle on/off without page reload).

### Target DOM Elements (ONLY replace text inside these):
- <code> elements
- <pre> elements  
- <kbd> elements
- elements with class names containing: "highlight", "prism", "hljs", "shiki", 
  "codeblock", "language-", "token", "line"
- GitHub-specific: .blob-code, .js-file-line, .highlight
- npm docs: .highlight
- Any element with role="code"

### Replacement Visual Indicator:
- Wrap each replaced text span in:
  <span class="bun-replaced" title="Replaced by Bun Everywhere" 
        style="background: rgba(251,191,36,0.15); border-radius: 3px; 
               cursor: help; border-bottom: 1px dashed #f59e0b;">
    {replaced text}
  </span>
- Add a small "🍞" emoji tooltip indicator on hover (CSS only, no JS events needed).
- Do NOT replace text inside <input>, <textarea>, or contenteditable elements.
- Do NOT break existing syntax highlighting (replace text nodes only, not HTML structure).

### Text Node Strategy:
- Walk only TEXT NODES inside the target elements.
- Use TreeWalker with NodeFilter to find text nodes.
- Perform replacements on textContent using the replacement rules.
- Only modify the text node value — do NOT innerHTML-inject into code elements 
  (to avoid breaking syntax highlighters), EXCEPT for the visual indicator spans 
  which must be injected carefully by splitting text nodes into: 
  [before-text-node] + [span element] + [after-text-node].

### Settings Shape (chrome.storage.sync):
```js
{
  globalEnabled: true,           // boolean
  excludedSites: [],             // string[] of hostnames e.g. ["docs.example.com"]
  providers: {
    npm: true,
    yarn: true,
    pnpm: true,
    npx: true,
    "yarn dlx": true,
    "pnpm dlx": true,
  }
}
```

### Default Settings:
All providers enabled, globalEnabled: true, excludedSites: [].
On first install (background.js onInstalled), write defaults to chrome.storage.sync.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 4 — background.js (Service Worker)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- On chrome.runtime.onInstalled: write default settings to chrome.storage.sync 
  (only if not already set, use a "initialized" key to check).
- On chrome.runtime.onInstalled: set the extension icon to the "on" state.
- Listen for messages from popup.js:
  - { action: "toggle" } → flip globalEnabled in storage, update icon badge, 
    send message to all active tabs to re-evaluate.
  - { action: "getState" } → respond with current globalEnabled value.
- Icon Badge:
  - When globalEnabled = true: badge text = "" (empty), icon = normal bun icon.
  - When globalEnabled = false: badge text = "OFF", badge background = "#6b7280" (gray).
- Use chrome.action.setBadgeText and chrome.action.setBadgeBackgroundColor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 5 — popup/popup.html + popup.js + popup.css
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Popup Design:
- Width: 300px. Clean, minimal design.
- Color scheme: warm amber/yellow (#f59e0b primary) on white, matching Bun's brand.
- Dark mode support via prefers-color-scheme.

### Popup Layout (top to bottom):
1. **Header**: Bun logo emoji 🍞 + "Bun Everywhere" title + version number (from manifest).
2. **Main Toggle**: Large, prominent ON/OFF toggle switch.
   - Label: "Replace commands on this page" with current domain shown.
   - Toggle state synced with globalEnabled from storage.
   - Clicking immediately sends { action: "toggle" } message to background.js.
   - Visual feedback: when OFF, entire popup dims slightly (opacity 0.6 on content below header).
3. **Current Site Section**:
   - Show current tab's hostname.
   - Button: "Exclude this site" → adds hostname to excludedSites in storage.
   - If already excluded, show "Remove exclusion" button instead (green → red state).
4. **Stats Section**:
   - Show "X replacements on this page" — content.js must track and report count via 
     chrome.runtime.sendMessage({ action: "reportCount", count: N }).
   - Background.js stores per-tab counts in memory (Map<tabId, count>).
   - Popup requests count via { action: "getCount" }.
5. **Footer Links**:
   - "⚙ Settings" → opens settings page via chrome.runtime.openOptionsPage().
   - "📋 Privacy Policy" → opens PRIVACY_POLICY.md on the extension's GitHub or 
     a local extension page.

### popup.js:
- On load: get current tab URL, load settings, render state.
- Toggle switch: animate smoothly with CSS transition.
- All storage operations use chrome.storage.sync.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 6 — settings/settings.html + settings.js + settings.css
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Settings Page Sections:

**Section 1 — General**
- Global enable/disable toggle (same as popup toggle, synced).
- "Show visual indicator" toggle → controls whether the amber highlight 
  span is injected (default: true). Store as settings.showIndicator.
- "Replacement count badge" toggle → show/hide the page count badge on icon.

**Section 2 — Package Manager Providers**
- Title: "Replace commands from:"
- One toggle row per provider: npm, yarn, pnpm, npx, yarn dlx, pnpm dlx.
- Each row shows:
  - Provider icon/badge (colored pill: npm=red, yarn=blue, pnpm=orange, npx=red).
  - Provider name.
  - ON/OFF toggle.
  - Example: "e.g. npm install → bun install" (pulled from REPLACEMENTS map, 
    show the first applicable rule as preview).
- Toggling a provider immediately saves to chrome.storage.sync.

**Section 3 — Excluded Sites**
- Title: "Excluded Sites"
- Description: "Bun Everywhere will not run on these sites."
- Input field + "Add Site" button to add a hostname manually 
  (validate: must be valid hostname format, no http://).
- List of currently excluded sites, each with:
  - Favicon (use https://www.google.com/s2/favicons?domain=HOSTNAME).
  - Hostname text.
  - "Remove" (✕) button.
- Empty state: "No sites excluded yet."
- Sites stored in chrome.storage.sync as excludedSites: string[].

**Section 4 — About**
- Extension name, version, description.
- Link to GitHub repo (placeholder: https://github.com/erbanku/bun-everywhere).
- Link to privacy policy (settings/privacy.html or PRIVACY_POLICY.md rendered).
- "Reset to defaults" button → with a confirmation dialog (custom, not browser alert), 
  resets all settings to defaults.

### settings.css:
- Full page layout, not constrained to 300px like popup.
- Same amber color scheme.
- Responsive: works on narrow chrome://extensions settings tab width.
- Smooth toggle animations.
- Section cards with subtle borders/shadows.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 7 — README.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate a full README.md with these sections:

1. # 🍞 Bun Everywhere
   - Tagline: "Automatically replace npm/yarn/pnpm commands with Bun on any webpage."
   - Badges: version, license (MIT), manifest v3.

2. ## Features
   - All replacement coverage (all providers).
   - One-click toggle from the toolbar icon.
   - Per-site exclusion list.
   - Visual amber highlight on replaced commands.
   - Replacement count per page.
   - Zero data collection. 100% local.

3. ## Installation
   - Chrome Web Store link (placeholder).
   - Manual/developer install steps (clone → load unpacked).

4. ## Command Replacement Reference
   - Full table of all replacements (npm, npx, yarn, pnpm sections).

5. ## Settings
   - Describe each settings option.

6. ## Privacy
   - One paragraph: no data leaves the browser, link to PRIVACY_POLICY.md.

7. ## Contributing
   - Fork, add rules to rules/replacements.js, open PR.

8. ## License
   - MIT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 8 — PRIVACY_POLICY.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate a complete, honest, legally reasonable privacy policy covering:

1. **Overview**: The extension operates entirely locally within the user's browser.
2. **Data Collected**: None. No personal data, no browsing history, no page content 
   is transmitted anywhere.
3. **Storage**: Only user preferences (toggle states, excluded sites list) are stored 
   locally in chrome.storage.sync (which syncs across the user's own Chrome profile 
   via their own Google account — no third-party server involved).
4. **Permissions Justification**:
   - storage: save user preferences.
   - activeTab / scripting: inject content script to replace commands on visible pages.
   - host_permissions <all_urls>: required to run on any site the user visits.
5. **Third Parties**: None. No analytics, no crash reporting, no ads.
6. **Children**: Not directed at children under 13.
7. **Changes**: Policy may be updated; users should check the GitHub repo.
8. **Contact**: Placeholder GitHub issues link.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 9 — AGENTS.md  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate a AGENTS.md file (AI agent context file) with:

1. **Project Summary**: What this extension does, tech stack (Vanilla JS, MV3, no bundler).
2. **Architecture Overview**: 
   - Describe each file's role in 1–2 sentences.
   - Data flow: settings storage → background → content → popup/settings.
3. **Key Design Decisions**:
   - Why text node manipulation (not innerHTML) for code blocks.
   - Why MutationObserver for SPA support.
   - Why chrome.storage.sync (not local) for cross-device settings.
   - No bundler/build step to keep extension auditable and simple.
4. **Adding New Replacement Rules**:
   - Step-by-step: edit rules/replacements.js, add { provider, pattern, replacement, bunCompatible }.
   - How to test: load unpacked, visit a page with that command.
5. **Known Limitations**:
   - Cannot replace commands in images/screenshots.
   - Does not replace commands inside editable fields.
   - Some sites with heavy CSP may block content script injection.
   - Commands split across multiple DOM elements (e.g., syntax-highlighted tokens) 
     may not be fully replaceable — document the known strategy for this.
6. **Testing Checklist**: List of sites to manually verify (GitHub README, 
   npmjs.com, yarnpkg.com, pnpm.io, official Bun docs, Vite docs, Next.js docs, etc.)
7. **Contribution Guidelines**: How to add providers, rules, and maintain the file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SPEC 10 — QUALITY & IMPLEMENTATION CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- NO build step, NO npm dependencies, NO bundler. Pure vanilla JS + MV3.
- All JS files must use ES modules where possible (type: module in script tags).
  Exception: content.js and background.js must be plain scripts (not modules) 
  because Chrome MV3 service workers and content scripts have module limitations.
  Use a IIFE or namespace pattern for them instead.
- For rules/replacements.js: export as a standard ES module if imported in settings.js 
  (settings page can use type=module). For content.js, inline the replacements directly 
  or use importScripts-compatible patterns.
- All settings changes must take effect on the NEXT page load for already-loaded tabs,
  and IMMEDIATELY for the current tab via a content script message listener.
- The extension must not throw any console errors in normal operation.
- Use strict mode ('use strict') everywhere.
- Write JSDoc comments on all exported functions and the REPLACEMENTS data structure.
- The popup must open and render within 100ms (no async blocking on open).
- Code must be clean enough to pass a Chrome Web Store review 
  (no eval, no remote code execution, no obfuscation).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DELIVERABLE FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Output every file as a separate fenced code block with the filename as the label.
For example:

```js // manifest.json
{ ... }
```

Output files in this order:
1. manifest.json
2. rules/replacements.js
3. background.js
4. content.js
5. popup/popup.html
6. popup/popup.css
7. popup/popup.js
8. settings/settings.html
9. settings/settings.css
10. settings/settings.js
11. README.md
12. PRIVACY_POLICY.md
13. AGENTS.md
14. icons/README.md (explain how to generate the icons using a canvas script 
    or provide an inline SVG that can be exported at each size)

Do not summarize. Do not skip any file. Output the complete contents of each file.
