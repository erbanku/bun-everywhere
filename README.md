# Bun Everywhere

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/erbanku/bun-everywhere)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

Automatically replace npm/yarn/pnpm commands with Bun on any webpage with intelligent highlighting and click-to-copy functionality.

![Bun Everywhere](assets/bun.avif)

## Features

- **Comprehensive Replacement Coverage** - Supports npm, yarn, pnpm, npx, yarn dlx, and pnpm dlx commands
- **Smart Multi-Line Detection** - Handles multi-line commands like `bun install @package/name --save`
- **Click-to-Copy Commands** - Click any highlighted command to copy it instantly (no copy buttons)
- **Visual Highlighting** - Amber highlighting shows which commands have been replaced
- **Auto-Copy on Page Load** - Automatically copies the first Bun command when page loads (enabled by default)
- **Go to Bun Button** - Fixed position button to quickly navigate to code with replacements
- **Per-Site Exclusion** - Add specific websites to an exclusion list
- **Zero Data Collection** - 100% local processing, no data leaves your browser
- **Manifest V3 Compatible** - Built with the latest Chrome Extension standards

## Installation

### Chrome Web Store
[Install from Chrome Web Store](https://chrome.google.com/webstore/detail/bun-everywhere/placeholder) *(coming soon)*

### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/erbanku/bun-everywhere.git
   cd bun-everywhere
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the `bun-everywhere` directory

5. The extension should now appear in your extensions list and toolbar

## Command Replacement Reference

### npm → bun
| npm Command | bun Equivalent |
|-------------|----------------|
| `npm install` | `bun install` |
| `npm i` | `bun install` |
| `npm install [package]` | `bun add [package]` |
| `npm install --save-dev [package]` | `bun add --dev [package]` |
| `npm install -D [package]` | `bun add --dev [package]` |
| `npm install --global [package]` | `bun add --global [package]` |
| `npm install -g [package]` | `bun add --global [package]` |
| `npm uninstall [package]` | `bun remove [package]` |
| `npm run [script]` | `bun run [script]` |
| `npm test` | `bun test` |
| `npm start` | `bun start` |
| `npm publish` | `bun publish` |
| `npm init` | `bun init` |
| `npm create [template]` | `bun create [template]` |
| `npm update` | `bun update` |
| `npm ci` | `bun install --frozen-lockfile` |

### npx → bunx
| npx Command | bunx Equivalent |
|-------------|-----------------|
| `npx [package]` | `bunx [package]` |

### yarn → bun
| yarn Command | bun Equivalent |
|-------------|----------------|
| `yarn` | `bun install` |
| `yarn install` | `bun install` |
| `yarn add [package]` | `bun add [package]` |
| `yarn add --dev [package]` | `bun add --dev [package]` |
| `yarn add -D [package]` | `bun add --dev [package]` |
| `yarn global add [package]` | `bun add --global [package]` |
| `yarn remove [package]` | `bun remove [package]` |
| `yarn run [script]` | `bun run [script]` |
| `yarn test` | `bun test` |
| `yarn start` | `bun start` |
| `yarn build` | `bun run build` |
| `yarn dlx [package]` | `bunx [package]` |
| `yarn create [template]` | `bun create [template]` |
| `yarn upgrade` | `bun update` |
| `yarn init` | `bun init` |

### pnpm → bun
| pnpm Command | bun Equivalent |
|-------------|----------------|
| `pnpm install` | `bun install` |
| `pnpm i` | `bun install` |
| `pnpm add [package]` | `bun add [package]` |
| `pnpm add --save-dev [package]` | `bun add --dev [package]` |
| `pnpm add -D [package]` | `bun add --dev [package]` |
| `pnpm add --global [package]` | `bun add --global [package]` |
| `pnpm add -g [package]` | `bun add --global [package]` |
| `pnpm remove [package]` | `bun remove [package]` |
| `pnpm run [script]` | `bun run [script]` |
| `pnpm test` | `bun test` |
| `pnpm start` | `bun start` |
| `pnpm dlx [package]` | `bunx [package]` |
| `pnpm create [template]` | `bun create [template]` |
| `pnpm update` | `bun update` |
| `pnpm init` | `bun init` |
| `pnpm exec [command]` | `bunx [command]` |

## Usage

### Automatic Operation
The extension works automatically in the background:

1. **Page Load**: Extension scans for npm/yarn/pnpm commands
2. **Smart Replacement**: Commands are replaced with Bun equivalents
3. **Visual Highlighting**: Replaced commands get amber highlighting
4. **Auto-Copy**: First command is automatically copied (if enabled)

### Click-to-Copy
- Click any highlighted command to copy it instantly
- Multi-line commands are copied completely (e.g., `bun install\n@package/name --save`)
- Visual feedback shows "Copied!" briefly

### Go to Bun Button
- Appears at top-right when replacements are found
- Click to smoothly scroll to the first replacement
- Button removes itself after use

### Settings
Access detailed settings by right-clicking the extension icon → "Options" or visiting `chrome://extensions/` → "Details" → "Extension options"

#### General Settings
- **Enable Bun Everywhere** - Master toggle for the entire extension
- **Auto-copy on page load** - Automatically copy the first Bun command (enabled by default)
- **Show visual indicator** - Highlight replaced commands with amber background
- **Replacement count badge** - Show number of replacements on the extension icon

#### Package Manager Providers
Toggle individual package managers on/off:
- npm (red badge)
- yarn (blue badge)  
- pnpm (orange badge)
- npx (red badge)
- yarn dlx (blue badge)
- pnpm dlx (orange badge)

#### Excluded Sites
Add websites where the extension should not run. Useful for:
- Package manager documentation sites
- Code playgrounds where original commands are important
- Sites with incompatible syntax highlighting

## Privacy

Bun Everywhere operates entirely within your browser. No personal data, browsing history, or page content is transmitted to any external service. All settings are stored locally using Chrome's storage API and sync across your own devices via your Google account.

See [PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) for detailed information.

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Add new replacement rules in `rules/replacements.js`
4. Test on various websites to ensure compatibility
5. Submit a pull request

### Adding New Replacement Rules

To add a new replacement rule:

1. Open `rules/replacements.js`
2. Add a new rule object to the `REPLACEMENTS` array:
   ```javascript
   {
     provider: 'npm',
     pattern: /\bnpm new-command\b/g,
     replacement: 'bun new-command',
     bunCompatible: true,
   }
   ```
3. Test the rule on a webpage containing the command

### Testing Checklist

Test the extension on these popular sites:
- GitHub README files
- npmjs.com package pages
- yarnpkg.com documentation
- pnpm.io documentation
- Official Bun documentation
- Vite documentation
- Next.js documentation
- Stack Overflow code blocks
- Medium articles with code

## Known Limitations

- Cannot replace commands in images or screenshots
- Does not replace commands inside editable fields (input, textarea)
- Some sites with strict Content Security Policies may block content script injection
- Commands split across multiple DOM elements (heavily syntax-highlighted) may not be fully replaceable

## Technical Details

- **Built with**: Vanilla JavaScript (no framework dependencies)
- **Manifest Version**: 3
- **Storage**: Chrome Storage API (sync across devices)
- **Permissions**: `storage`, `activeTab`, `scripting`, &lt;all_urls&gt;
- **Browser Support**: Chrome 88+, Edge 88+

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Report bugs: [GitHub Issues](https://github.com/erbanku/bun-everywhere/issues)
- Feature requests: [GitHub Issues](https://github.com/erbanku/bun-everywhere/issues)
- Contact: [GitHub Discussions](https://github.com/erbanku/bun-everywhere/discussions)

---

Made with love for the Bun community.
