# Changelog

All notable changes to the Tidemark plugin will be documented in this file.

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
