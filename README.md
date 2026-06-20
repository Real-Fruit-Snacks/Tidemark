<div align="center">

  # Tidemark

  **Obsidian plugin for variable substitution in markdown via YAML frontmatter.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-cba6f7.svg)](LICENSE)
  [![Version](https://img.shields.io/badge/version-1.0.0-89b4fa)](https://github.com/Real-Fruit-Snacks/Tidemark/releases)

  [Report Issue](https://github.com/Real-Fruit-Snacks/Tidemark/issues)

</div>

---

## Overview

Tidemark is a **variable-substitution plugin for Obsidian**. Define variables in YAML frontmatter, reference them with `{{variable}}` syntax anywhere in your document, then copy or replace with a single command. Variables are color-coded in the editor so you can see at a glance which ones are defined, which fall back to defaults, and which are missing.

The core engine parses YAML frontmatter, resolves nested dot-notation and joined arrays, and emits CodeMirror decorations for real-time syntax highlighting.

---

## Key Features

- **Mustache-Style Syntax**: Use `{{variable}}`, `{{variable:default}}`, and `{{nested.path}}` to reference frontmatter values.
- **9 Palette Commands**: Copy or permanently replace variables by line, selection, or entire document.
- **Live Syntax Highlighting**: CodeMirror decorations color-code variables by status (Green = set, Orange = default fallback, Red = missing).
- **Nested Properties & Arrays**: Supports dot-notation for nested YAML structures and automatic array joining.
- **Configurable Delimiters**: Customize open/close delimiters, default separators, and missing-value text.
- **Cross-Platform**: Full support on Desktop, iOS, and Android.

---

## Getting Started / Installation

### Community Plugins (Recommended)

1. Open Obsidian Settings and navigate to Community Plugins.
2. Browse and search for "Tidemark".
3. Install and Enable.

### Build from Source

Prerequisites: **Node.js 18+**

```bash
git clone https://github.com/Real-Fruit-Snacks/Tidemark.git
cd Tidemark
npm install
npm run build

cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/tidemark/
```

---

## Usage

1. Add YAML frontmatter to any note with your desired variables.
2. Reference them in the document body using `{{variable}}` syntax.
3. Open the Command Palette (`Ctrl/Cmd+P`) and search for "Tidemark" to access all available commands:
   - **Copy current line (replaced)**: Copy the line at cursor with variables filled in.
   - **Copy selection (replaced)**: Copy the selected text with variables filled in.
   - **Copy document (replaced)**: Copy the entire note with variables filled in.
   - **Replace in selection**: Permanently substitute variables in the selected text.
   - **Replace all in document**: Replace all variables throughout the document body.
   - **List all variables**: View and edit all variables organized by status.

---

## Architecture / File Structure

```
Tidemark/
├── src/
│   ├── main.ts                    Plugin entry and command registration
│   ├── variableReplacer.ts        Core replacement engine
│   ├── frontmatterParser.ts       YAML frontmatter extraction
│   ├── decorationProvider.ts      CodeMirror syntax highlighting
│   ├── types.ts                   TypeScript interfaces
│   ├── commands/                  Command handlers
│   └── utils/                     String helpers and YAML utilities
├── manifest.json                  Obsidian plugin manifest
├── esbuild.config.mjs             Build configuration
├── styles.css                     Plugin styles
└── docs/                          GitHub Pages site
```

Variable resolution is a pure function of `(text, frontmatter, settings)` with no external mutable state. The highlight decorations reflect the same resolver, so what you see in the editor is exactly what you get on copy or replace.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to help improve the project. Be sure to also review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## License

This project is licensed under the [MIT License](LICENSE).
