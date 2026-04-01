# AGENTS.md - AI Agent Context for Bun Everywhere Extension

This document provides AI agents with comprehensive context about the Bun Everywhere Chrome Extension for development, maintenance, and enhancement tasks.

## Project Summary

**Bun Everywhere** is a Chrome Extension (Manifest V3) that automatically replaces npm/yarn/pnpm/npx commands found in web page code blocks with their Bun equivalents. The extension operates entirely locally within the browser, scanning DOM elements for package manager commands and replacing them with faster Bun alternatives. Features intelligent multi-line detection, click-to-copy functionality, and auto-copy on page load.

### Tech Stack
- **Frontend:** Vanilla JavaScript (no frameworks)
- **Extension API:** Chrome Extension Manifest V3
- **Storage:** Chrome Storage API (sync across devices)
- **Build System:** None (pure JS/CSS/HTML files)
- **Dependencies:** Zero external dependencies

### Core Functionality
- Real-time command replacement in code blocks
- Smart multi-line command detection and handling
- Click-to-copy functionality (no copy buttons)
- Auto-copy first command on page load (enabled by default)
- Provider-specific toggles (npm, yarn, pnpm, npx, yarn dlx, pnpm dlx)
- Per-site exclusion system
- Visual highlighting of replaced commands
- Go to Bun navigation button
- No popup interface - minimal UI design

## Architecture Overview

### File Structure and Responsibilities

```
bun-everywhere/
├── manifest.json           # Extension configuration and permissions
├── background.js           # Service worker: lifecycle, messaging, icon state
├── content.js             # Content script: DOM scanning, text replacement, click handlers
├── settings/              # Full-page settings interface (no popup)
│   ├── settings.html      # Settings page layout
│   ├── settings.css       # Settings page styling (responsive)
│   └── settings.js        # Settings management and UI interactions
├── icons/                 # Extension icons (16, 48, 128px)
├── README.md              # User documentation
├── PRIVACY_POLICY.md      # Privacy compliance documentation
└── AGENTS.md              # This file - AI agent context
```

### Data Flow Architecture

1. **Settings Storage** → chrome.storage.sync → All components
2. **Background Script** ↔ Content Script via chrome.runtime messaging  
3. **Content Script** → DOM manipulation → Visual replacements & click handlers
4. **Content Script** → Background Script → Replacement counts
5. **Content Script** → Clipboard API → Auto-copy functionality

### Component Interactions

```
User Settings (chrome.storage.sync)
    ↓
Background.js (Service Worker)
    ↓ ↕
settings.js (UI controls - no popup)
    ↓
Content.js (DOM processing, multi-line detection, click handlers)
    ↓
Web Page (command replacements, highlighting, click-to-copy)
    ↑
Replacement Count → Background.js → Settings display
```

## Key Design Decisions

### 1. Element-Level Processing vs Text Node Processing
**Decision:** Process entire element text content rather than individual text nodes.

**Rationale:**
- Enables multi-line command detection (e.g., `bun install\n@package/name --save`)
- Simplifies command grouping and copying
- Better handles complex code block structures
- Maintains complete command context

**Implementation:**
```javascript
function processElement(element) {
  const originalText = element.textContent;
  // Apply replacements to full text, then highlight
  element.innerHTML = highlightReplacements(originalText, newText);
}
```

### 2. Click-to-Copy vs Copy Buttons
**Decision:** Use click-to-copy on highlighted commands instead of separate copy buttons.

**Rationale:**
- Cleaner, minimal interface
- Direct interaction with the content
- Better mobile experience
- Reduces UI clutter

**Implementation:**
```javascript
// Click handlers attached to highlighted spans
element.addEventListener('click', async () => {
  await navigator.clipboard.writeText(command);
});
```

### 3. Auto-Copy on Page Load
**Decision:** Automatically copy first Bun command when page loads (enabled by default).

**Rationale:**
- Instant utility for users reading documentation
- Reduces friction for common workflows
- Can be disabled in settings for privacy

### 4. No Popup Interface
**Decision:** Remove popup interface, use only settings page.

**Rationale:**
- Simpler user experience
- Extension works automatically
- Settings accessed via right-click → Options
- Focus on functionality over UI

### 3. Chrome Storage Sync vs Local
**Decision:** Use chrome.storage.sync for settings persistence.

**Rationale:**
- Settings sync across user's devices automatically
- Leverages Google's secure sync infrastructure
- No additional backend required
- Users expect cross-device consistency

### 4. No Build Step Architecture
**Decision:** Pure vanilla JS without bundling or transpilation.

**Rationale:**
- Extension remains auditable and transparent
- No dependency security vulnerabilities
- Faster load times in extension context
- Easier for contributors to understand and modify
- Chrome Web Store review process simplified

## Adding New Replacement Rules

### Step-by-Step Process

1. **Edit rules/replacements.js**
   ```javascript
   {
     provider: 'npm',
     pattern: /\bnpm new-command\s+([^\s\n]+)/g,
     replacement: 'bun new-command $1',
     bunCompatible: true,
   }
   ```

2. **Rule Properties Explained**
   - `provider`: Which provider toggle controls this rule
   - `pattern`: Regex with word boundaries, case-sensitive
   - `replacement`: String replacement with capture groups ($1, $2, etc.)
   - `bunCompatible`: false if no Bun equivalent exists

3. **Order Matters**
   - More specific patterns should come first
   - Patterns with capture groups before simple ones
   - Example: `npm install --save-dev` before `npm install`

4. **Testing New Rules**
   - Load extension in Chrome developer mode
   - Visit a page containing the target command
   - Verify replacement works correctly
   - Check visual highlighting appears
   - Test toggle functionality

### Rule Writing Guidelines

- **Word Boundaries:** Always use `\b` to avoid partial matches
- **Case Sensitivity:** Commands are lowercase, patterns should be case-sensitive
- **Capture Groups:** Use `([^\s\n]+)` for package names/arguments
- **Global Flag:** Always include `/g` for multiple replacements
- **No Bun Equivalent:** Set `bunCompatible: false` and `replacement: null`

## Known Limitations

### 1. Image/Screenshot Content
Commands in images or screenshots cannot be replaced.
**Impact:** Documentation with screenshots will show original commands.
**Mitigation:** None currently - this is a fundamental limitation.

### 2. Editable Fields
Commands inside `<input>`, `<textarea>`, or `contenteditable` elements are ignored.
**Rationale:** Prevents interference with user input and form functionality.

### 3. Content Security Policy (CSP)
Sites with strict CSP may block content script injection.
**Impact:** Extension won't work on some corporate or security-focused sites.
**Mitigation:** Users can add these sites to the exclusion list.

### 4. Split DOM Elements
Heavily syntax-highlighted code may split commands across multiple elements.
**Example:** `<span class="token">npm</span><span class="token"> </span><span class="token">install</span>`
**Current Strategy:** Only processes complete text nodes, so these won't be replaced.
**Future Enhancement:** Could implement element-joining logic for complex cases.

### 5. Dynamic Framework Rendering
Some frameworks (CodeMirror, Monaco) render code in canvas or custom elements.
**Impact:** Text replacement may not work in these environments.
**Mitigation:** Framework-specific adapters could be developed.

## Testing Checklist

### Manual Testing Sites
Test the extension on these representative sites:

#### Documentation Sites
- [ ] GitHub README files and code blocks
- [ ] npmjs.com package documentation
- [ ] yarnpkg.com documentation
- [ ] pnpm.io documentation
- [ ] Official Bun documentation (bun.sh)
- [ ] MDN Web Docs code examples

#### Framework Documentation
- [ ] Vite documentation
- [ ] Next.js documentation
- [ ] React documentation
- [ ] Vue.js documentation
- [ ] Angular documentation

#### Code Platforms
- [ ] Stack Overflow questions and answers
- [ ] CodePen examples
- [ ] JSFiddle examples
- [ ] Replit projects
- [ ] Glitch projects

#### Blog Platforms
- [ ] Medium articles with code blocks
- [ ] Dev.to posts
- [ ] Hashnode articles
- [ ] Personal blogs with syntax highlighting

### Functional Testing Checklist

#### Basic Functionality
- [ ] Commands are replaced in code blocks
- [ ] Visual highlighting appears correctly
- [ ] Replacement count updates in popup
- [ ] Toggle enables/disables replacements
- [ ] Site exclusion works properly

#### Provider Testing
- [ ] npm commands replace correctly
- [ ] yarn commands replace correctly
- [ ] pnpm commands replace correctly
- [ ] npx commands replace correctly
- [ ] yarn dlx commands replace correctly
- [ ] pnpm dlx commands replace correctly

#### Settings Testing
- [ ] Individual provider toggles work
- [ ] Visual indicator toggle works
- [ ] Badge count toggle works
- [ ] Excluded sites add/remove works
- [ ] Reset to defaults works

#### Edge Cases
- [ ] Commands with flags and arguments
- [ ] Multiple commands in same block
- [ ] Mixed case commands (should not replace)
- [ ] Partial matches (should not replace)
- [ ] Commands in comments vs code

## Contribution Guidelines

### Adding New Providers

1. **Update PROVIDERS object** in `rules/replacements.js`
2. **Add replacement rules** for the new provider
3. **Update settings UI** in `settings/settings.html` and `settings.js`
4. **Add provider badge styling** in `settings/settings.css`
5. **Update documentation** in `README.md`

### Code Style Guidelines

- **JavaScript:** Use strict mode, JSDoc comments for functions
- **CSS:** BEM-like naming, mobile-first responsive design
- **HTML:** Semantic markup, accessibility attributes
- **File Organization:** Keep files focused and single-purpose

### Testing Requirements

- Test on latest Chrome and Edge versions
- Verify Chrome Web Store compliance
- Check memory usage and performance
- Validate accessibility (screen readers, keyboard navigation)

### Release Process

1. Update version in `manifest.json`
2. Update documentation version numbers
3. Test thoroughly on multiple sites
4. Create GitHub release with changelog
5. Submit to Chrome Web Store
6. Update documentation with store link

## Security Considerations

### Content Security
- No eval() or dynamic code execution
- No remote code loading or injection
- Sanitize all user inputs in settings
- Use textContent instead of innerHTML where possible

### Permission Minimization
- Request only necessary permissions
- Explain each permission in manifest
- Use activeTab for minimal tab access
- No background page persistence beyond service worker

### Data Protection
- All processing happens locally
- No network requests for data transmission
- Settings encrypted by Chrome's sync
- No telemetry or analytics collection

## Performance Optimization

### DOM Processing
- Use TreeWalker for efficient text node traversal
- Debounce MutationObserver callbacks
- Limit replacement scope to code elements only
- Cache DOM queries where possible

### Memory Management
- Clean up MutationObserver on page unload
- Avoid memory leaks in event listeners
- Use weak references for temporary data
- Limit replacement count storage in memory

### Extension Lifecycle
- Minimize service worker memory usage
- Use efficient messaging patterns
- Lazy load settings only when needed
- Proper cleanup on extension disable/uninstall

---

This context document should be updated as the extension evolves. For specific implementation questions, refer to the source code and inline comments in each file.
