# Changelog

All notable changes to the Tidemark plugin will be documented in this file.

## [1.0.6]

### Added
- Automated test suite (Vitest, 62 tests) covering the variable-replacement engine, frontmatter parsing, the prototype-pollution guards, the ReDoS delimiter caps, and filename sanitization. Continuous integration already ran the test step, but it previously had no tests to run.

### Changed
- Pinned the Obsidian API development dependency to a fixed version so builds are reproducible instead of tracking whatever `latest` resolves to.

## [1.0.5]

### Changed
- Code-quality pass to meet the Obsidian community plugin guidelines: replaced `any` with precise types and removed blanket lint suppressions, settings section headings now use the standard `setHeading()` API, editor decorations read the active document for popout-window compatibility, and command promises are handled explicitly. No behavior changes.

### Added
- Release assets are now published with GitHub artifact attestations so their provenance can be cryptographically verified.

## [1.0.4]

### Changed
- Rebranded onto the Terminal Workbench design system. Default variable highlight colors are now mint (resolved), amber (has default), and red (missing); the light-mode variants darken for contrast. Custom colors set in settings are unaffected.
- New README, logo, icon, and documentation site.

## [1.0.3]

### Fixed
- Setting or editing a variable no longer overwrites frontmatter when the existing frontmatter is invalid YAML or has an unclosed block. These cases now stop with a clear error notice and leave the document untouched.
- Setting or editing a variable now rewrites only the frontmatter block instead of replacing the whole document, preserving scroll position and producing a single clean undo step.
- Highlight colors are validated as `#RRGGBB` before use; invalid values fall back to the theme default instead of leaking into the editor styles.
- Settings saves that fail (for example, a disk error) are now caught and reported rather than surfacing as an unhandled promise rejection.

### Changed
- Editor variable highlighting now scans only the visible portion of the document and caches the parsed frontmatter, greatly reducing per-keystroke work in large notes. As a result, highlighting is no longer disabled on documents over 1 MB.
- "Replace all in document" and "Replace in document and filename" now apply targeted edits in a single transaction instead of rewriting the entire document, preserving cursor and scroll position. Documents over 1 MB report an explicit error instead of silently doing nothing.

## [1.0.0] - Obsidian Release

### Platform Migration
- Migrated from VSCode extension to Obsidian plugin
- Rewrote decoration engine using CodeMirror 6 ViewPlugin
- Rewrote settings UI using Obsidian PluginSettingTab
- Rewrote all commands using Obsidian Editor API
- Rewrote variable list using Obsidian SuggestModal
- Rewrote set variable using Obsidian Modal
- Replaced webpack with esbuild for bundling
- Notifications now use Obsidian Notice API

### Features
- Variable replacement in markdown with YAML frontmatter values
- Copy commands (line, selection, document) with variables replaced
- Replace commands (selection, document, document+filename)
- Rename file with variables replaced
- Real-time syntax highlighting (green/orange/red) via CodeMirror 6
- Context menu to set/edit variable values
- List all variables command with searchable modal
- Comprehensive settings (12 configurable options):
  - Custom delimiters (change from `{{}}` to any delimiters)
  - Nested property support (dot notation: `{{server.ip}}`)
  - Default values (`{{var:default}}`)
  - Case-insensitive matching
  - Array handling with custom separators
  - Customizable highlight colors (Catppuccin Latte/Mocha defaults)
  - Preserve original on missing option
  - Configurable notification levels

### Supported Features
- Basic variables: `{{variableName}}`
- Default values: `{{variableName:defaultValue}}`
- Nested properties: `{{server.ip}}`
- Array indices: `{{items[0]}}`
- Array values (auto-joined with configurable separator)
- Custom delimiters (e.g., `<var>`, `${var}`, `[[var]]`)
- Case-insensitive matching
- Frontmatter validation

### Technical Details
- TypeScript implementation
- Obsidian Plugin API 1.0+
- CodeMirror 6 for editor decorations
- js-yaml for YAML parsing
- esbuild for bundling
- Theme-aware syntax highlighting (light/dark auto-detection)
- Cross-platform support (Windows, macOS, Linux, mobile)

## [Unreleased]

### Planned Features
- Status bar item showing variable count
- Auto-completion for variable names
- Variable rename refactoring across document
- Batch variable updates across multiple files
