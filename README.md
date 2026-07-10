<div align="center">

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-dark.svg" />
    <img alt="Tidemark" src="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-light.svg" width="480" />
  </picture>

  **Replace `{{variables}}` in your Obsidian notes with values from YAML frontmatter — color-coded in the editor, resolved on demand.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-63f2ab.svg)](LICENSE)
  [![Latest release](https://img.shields.io/github/v/release/Real-Fruit-Snacks/Tidemark?color=6bdcff&label=release)](https://github.com/Real-Fruit-Snacks/Tidemark/releases)
  [![Obsidian](https://img.shields.io/badge/Obsidian-1.0%2B-f0c674.svg)](https://obsidian.md)

  [Install](https://obsidian.md/plugins?id=tidemark) · [Documentation](https://real-fruit-snacks.github.io/Tidemark/) · [Changelog](CHANGELOG.md) · [Report an issue](https://github.com/Real-Fruit-Snacks/Tidemark/issues)

</div>

---

## Overview

Tidemark is a variable-substitution plugin for Obsidian. Define values once in a note's YAML frontmatter, reference them anywhere in the body with `{{variable}}` syntax, and copy or replace them with a single command. Every token is color-coded live in the editor — mint when it resolves, amber when it falls back to a default, red when it's missing — so you can see the state of a template at a glance.

The engine parses frontmatter, resolves nested dot-notation and joined arrays, and emits CodeMirror decorations for real-time highlighting. Frontmatter is only ever read for substitution and written through Obsidian's own APIs, so your YAML stays valid.

## Features

- **Color-coded states** — resolved, has-default, and missing tokens are tinted as you type.
- **Nested & arrays** — `{{server.ip}}`, `{{items[0]}}`, and arrays joined by a configurable separator.
- **Inline defaults** — `{{port:22}}` uses the default when the key isn't set.
- **Copy or replace** — line, selection, or whole document, with variables resolved.
- **Rename from variables** — resolve variables in the filename via Obsidian's file manager.
- **Set values in place** — a command and editor-menu item to set a variable's frontmatter value from the cursor.
- **List variables** — a searchable modal of every variable in the document and its state.
- **Custom delimiters** — swap `{{ }}` and the default separator for your own.

## Syntax

| Form | Meaning |
| --- | --- |
| `{{name}}` | Resolve `name` from frontmatter |
| `{{name:fallback}}` | Use `fallback` if `name` is missing |
| `{{server.ip}}` | Nested dot-notation |
| `{{items[0]}}` | Array index |

## Installation

**Requires Obsidian 1.0 or newer.**

### Community plugins (recommended)

1. Open **Settings → Community plugins → Browse**.
2. Search for **Tidemark**, then **Install** and **Enable**.

Or open it straight from [obsidian.md/plugins?id=tidemark](https://obsidian.md/plugins?id=tidemark).

### BRAT (latest pre-release)

Install [BRAT](https://github.com/TfTHacker/obsidian42-brat), then add `Real-Fruit-Snacks/Tidemark` as a beta plugin.

### Manual

Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/Real-Fruit-Snacks/Tidemark/releases/latest) into `<your-vault>/.obsidian/plugins/tidemark/`, then enable Tidemark under **Settings → Community plugins**.

## Commands

| Command | Description |
| --- | --- |
| Copy current line (replaced) | Copy the cursor's line with variables resolved |
| Copy selection (replaced) | Copy the selection with variables resolved |
| Copy document (replaced) | Copy the whole document with variables resolved |
| Replace in selection | Replace variables in the selection (or line) in place |
| Replace all in document | Replace every variable in the document body |
| Replace in document and filename | Replace in the body and rename the file |
| Rename file (replace variables) | Resolve variables in the filename only |
| List all variables | Open a searchable list of variables and their state |
| Set variable value | Set the frontmatter value for the variable at the cursor |

A **Tidemark: Set variable value** item is also added to the editor right-click menu.

## How it works

Values live in the note's frontmatter; `{{variables}}` in the body reference them. Tidemark reads the frontmatter from the live editor buffer (so unsaved edits count), resolves each token, and colors it by state. Copy commands leave the document untouched; replace commands apply targeted edits; and setting a value writes only the frontmatter block — never overwriting invalid YAML.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## License

Released under the [MIT License](LICENSE).
