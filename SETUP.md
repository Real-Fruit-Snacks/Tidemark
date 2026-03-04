# Development Setup Guide - Tidemark

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- TypeScript compiler
- Obsidian API type definitions
- js-yaml library
- esbuild bundler
- ESLint for code quality

### 2. Build the Plugin

```bash
npm run build
```

This type-checks and bundles the plugin into `main.js` at the project root.

### 3. Run in Development Mode

```bash
npm run dev
```

This runs esbuild in watch mode, rebuilding `main.js` on every source change.

### 4. Test in Obsidian

1. Create a symlink or copy the project folder to your vault's `.obsidian/plugins/tidemark/` directory
2. Enable the plugin in Settings > Community Plugins
3. Create a test markdown file:
   ```markdown
   ---
   name: Test User
   age: 25
   ---

   Hello {{name}}, you are {{age}} years old.
   ```

4. Test syntax highlighting:
   - `{{name}}` and `{{age}}` should be highlighted in green

5. Test copy command:
   - Put cursor on line with variables
   - Open Command Palette (Ctrl/Cmd+P)
   - Run "Tidemark: Copy current line (replaced)"
   - Paste - should see "Hello Test User, you are 25 years old."

6. Test all other commands via Command Palette

## File Structure

```
tidemark/
├── src/
│   ├── main.ts                  # Plugin entry point
│   ├── types.ts                 # TypeScript interfaces
│   ├── variableReplacer.ts      # Core replacement logic
│   ├── frontmatterParser.ts     # YAML parsing
│   ├── decorationProvider.ts    # CodeMirror 6 syntax highlighting
│   ├── commands/
│   │   ├── copyCommands.ts      # Copy with replacement
│   │   ├── replaceCommands.ts   # In-place replacement
│   │   ├── renameCommand.ts     # File rename
│   │   ├── setVariableCommand.ts # Context menu edit
│   │   └── listVariablesCommand.ts # Variable list UI
│   └── utils/
│       ├── settings.ts          # Config management + settings tab
│       ├── notifications.ts     # User messages
│       └── fileOperations.ts    # File utilities
├── main.js                      # Bundled output (generated)
├── manifest.json                # Obsidian plugin manifest
├── styles.css                   # Plugin styles
├── versions.json                # Version compatibility
├── package.json                 # NPM config
├── tsconfig.json                # TypeScript config
├── esbuild.config.mjs           # Build config
├── README.md                    # User documentation
├── CHANGELOG.md                 # Version history
└── LICENSE                      # MIT license
```

## Development Commands

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build (type-check + minified bundle)
npm run build

# Lint code
npm run lint
```

## Debugging

### Console Logging

Add debug output:
```typescript
console.log('Debug:', variable);
```

View in:
- **Developer Tools**: Ctrl+Shift+I in Obsidian > Console tab
- Check for errors during testing

### Common Issues

**Plugin doesn't load**
- Check that `main.js` and `manifest.json` are in the plugin folder
- Check Developer Console for errors
- Ensure plugin is enabled in Community Plugins settings

**Decorations not updating**
- Check if `highlightVariables` setting is enabled
- Verify the file is a markdown note

**Commands not found**
- Verify plugin is enabled
- Search "Tidemark" in the Command Palette
- Check Developer Console for registration errors

## Testing Checklist

Before releasing, test all features:

### Basic Functionality
- [ ] Syntax highlighting works (green/orange/red)
- [ ] Highlighting updates on edit
- [ ] Highlighting respects settings changes
- [ ] Custom delimiters work (test with `<>`, `${}`, etc.)

### Copy Commands
- [ ] Copy current line (replaced)
- [ ] Copy selection (replaced)
- [ ] Copy document (replaced)
- [ ] Variables replaced correctly
- [ ] Clipboard contains expected text

### Replace Commands
- [ ] Replace in selection
- [ ] Replace in document
- [ ] Replace in document and filename
- [ ] Original text changed correctly
- [ ] Cursor position preserved

### Variable Features
- [ ] Basic variables: `{{var}}`
- [ ] Default values: `{{var:default}}`
- [ ] Nested properties: `{{obj.prop}}`
- [ ] Array values joined correctly
- [ ] Array indices: `{{items[0]}}`
- [ ] Case-insensitive matching (when enabled)

### UI Commands
- [ ] Context menu "Set Variable" appears
- [ ] Context menu edits frontmatter correctly
- [ ] List Variables shows all variables
- [ ] List Variables allows editing

### Settings
- [ ] All 12 settings appear in UI
- [ ] Settings changes apply immediately
- [ ] Custom delimiters work
- [ ] Custom colors apply
- [ ] Notification levels respected
- [ ] Preserve original on missing works

### Edge Cases
- [ ] Empty frontmatter (`---\n---`)
- [ ] No frontmatter
- [ ] Malformed YAML (error handling)
- [ ] Very long variable names
- [ ] Special characters in values
- [ ] Windows reserved filenames (CON, PRN, etc.)
- [ ] Large files (performance)

## Packaging for Release

### 1. Update Version

Edit `package.json` and `manifest.json`:
```json
{
  "version": "1.1.0"
}
```

Update `versions.json` with the new version mapping.

### 2. Update Changelog

Add entry to `CHANGELOG.md` for the new version.

### 3. Build Production Bundle

```bash
npm run build
```

### 4. Create Release

The release consists of three files:
- `main.js` — bundled plugin code
- `manifest.json` — plugin metadata
- `styles.css` — plugin styles

Create a GitHub release with these files attached, or push a version tag to trigger the automated release workflow.

## Resources

- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [CodeMirror 6 Documentation](https://codemirror.net/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [js-yaml Documentation](https://github.com/nodeca/js-yaml)

## Support

- **Issues**: Report on [GitHub](https://github.com/real-fruit-snacks/tidemark/issues)
- **Questions**: Open a discussion on GitHub
- **Documentation**: See [README.md](README.md)
