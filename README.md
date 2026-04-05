<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-light.svg">
  <img alt="Tidemark" src="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-dark.svg" width="520">
</picture>

![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)
![Platform](https://img.shields.io/badge/platform-Obsidian-7C3AED)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Obsidian plugin for variable substitution in markdown via YAML frontmatter**

Define variables in YAML frontmatter, reference them with `{{variable}}` syntax anywhere in your document, then copy or replace with a single command. Supports nested properties, arrays, default values, and syntax highlighting. Perfect for pentesting workflows, CTF notes, and reusable note templates.

[Quick Start](#quick-start) • [Variable Syntax](#variable-syntax) • [Commands](#commands) • [Configuration](#configuration) • [Use Cases](#use-cases) • [Architecture](#architecture)

</div>

---

## Highlights

<table>
<tr>
<td width="50%">

**Variable Replacement**
Replace `{{variables}}` with YAML frontmatter values on demand. Copy to clipboard or permanently replace in-document. Supports nested properties, arrays, and default values.

**Syntax Highlighting**
Color-coded variables in the editor: green for existing values, orange for variables with defaults, red for missing. See variable status at a glance without running anything.

**Nested Properties**
Access nested YAML with dot notation: `{{server.ip}}`, `{{credentials.user}}`. Array indexing with `{{items[0]}}`. Toggle nesting on or off per your workflow.

</td>
<td width="50%">

**Quick Copy**
Copy current line, selection, or entire document with variables replaced directly to clipboard. Paste commands straight into your terminal with values already filled in.

**Variable List & Context Menu**
Use List All Variables to see every variable grouped by status, edit values, and navigate to locations. Right-click any variable to set its value directly.

**Flexible Configuration**
Custom delimiters, default values, case-insensitive matching, array join separators, missing value text, notification levels. Every aspect is configurable through Obsidian settings.

</td>
</tr>
</table>

---

## Quick Start

### Prerequisites

<table>
<tr>
<th>Requirement</th>
<th>Version</th>
<th>Purpose</th>
</tr>
<tr>
<td>Obsidian</td>
<td>1.0+</td>
<td>Plugin host</td>
</tr>
<tr>
<td>Node.js</td>
<td>18+</td>
<td>Building from source (optional)</td>
</tr>
</table>

### Install

**From Community Plugins:**
1. Open Obsidian Settings > Community Plugins
2. Click "Browse" and search for "Tidemark"
3. Click Install, then Enable

**Manual Installation:**
```bash
# Download from latest release
# Copy main.js, manifest.json, styles.css to .obsidian/plugins/tidemark/
```

### Build from Source

```bash
# Clone repository
git clone https://github.com/Real-Fruit-Snacks/Tidemark.git
cd Tidemark

# Install dependencies
npm install

# Build plugin
npm run build

# Copy to vault
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/tidemark/
```

### Verification

```bash
# Open Obsidian
# Settings > Community Plugins > Enable Tidemark
# Create a note with frontmatter variables
# Open Command Palette > "Tidemark: Copy current line (replaced)"
```

---

## Variable Syntax

### Basic Variable

```
{{variableName}}
```

### Variable with Default Value

```
{{port:1-1000}}
{{username:root}}
{{protocol:https}}
```

### Nested Properties (Dot Notation)

```markdown
---
target:
  ip: 10.10.10.1
  port: 8080
credentials:
  user: admin
---

curl http://{{target.ip}}:{{target.port}}
ssh {{credentials.user}}@{{target.ip}}
```

### Array Handling

```markdown
---
ports:
  - 22
  - 80
  - 443
---

Open ports: {{ports}}
# Result: Open ports: 22, 80, 443
```

---

## Commands

Access via Command Palette (Ctrl/Cmd+P), then type "Tidemark":

| Command | Description |
|---------|-------------|
| **Copy current line (replaced)** | Copy line to clipboard with variables replaced |
| **Copy selection (replaced)** | Copy selected text with variables replaced |
| **Copy document (replaced)** | Copy entire document with variables replaced |
| **Replace in selection** | Permanently replace variables in selection |
| **Replace all in document** | Replace all variables in document body |
| **Replace in document and filename** | Replace in document and rename file |
| **Rename file (replace variables)** | Rename file with variables replaced |
| **List all variables** | View and edit all variables |
| **Set variable value** | Set/edit variable at cursor position |

Configure keyboard shortcuts in Obsidian Settings > Hotkeys > search "Tidemark".

---

## Configuration

Access via Settings > Community Plugins > Tidemark:

### Delimiters

| Setting | Default | Description |
|---------|---------|-------------|
| `openDelimiter` | `{{` | Characters marking variable start |
| `closeDelimiter` | `}}` | Characters marking variable end |
| `defaultSeparator` | `:` | Separator for default values (`{{var:default}}`) |

### Behavior

| Setting | Default | Description |
|---------|---------|-------------|
| `missingValueText` | `[MISSING]` | Text when variable not found |
| `supportNestedProperties` | `true` | Enable dot notation for nested properties |
| `caseInsensitive` | `false` | Match variables regardless of case |
| `arrayJoinSeparator` | `, ` | Characters used to join array values |
| `preserveOriginalOnMissing` | `false` | Keep `{{var}}` if not found instead of replacing |
| `notificationLevel` | `all` | `all`, `errors`, or `none` |

### Visual

| Setting | Default | Description |
|---------|---------|-------------|
| `highlightVariables` | `true` | Color-code variables in editor |
| `highlightColors.exists` | auto | Color for set variables |
| `highlightColors.missing` | auto | Color for missing variables |
| `highlightColors.hasDefault` | auto | Color for variables with defaults |

---

## Use Cases

### Pentesting Workflow

Create template notes for different target types:

```markdown
---
IPAddress:
hostname:
---

# Recon Commands
nmap -sV -sC {{IPAddress}}
nikto -h {{IPAddress}}
gobuster dir -u http://{{IPAddress}} -w /path/to/wordlist

# Quick Shell
nc {{IPAddress}} {{port:4444}}
```

**Workflow:**
1. Duplicate template for each target
2. Fill in frontmatter values
3. Use **Copy current line (replaced)** to copy commands with values filled
4. Paste directly into terminal

### CTF Notes

```markdown
---
challenge: Web Exploitation 101
flag: CTF{not_found_yet}
url: http://ctf.example.com
---

# {{challenge}}

Target: {{url}}
Flag: {{flag}}

# Commands
curl {{url}}/robots.txt
sqlmap -u "{{url}}/login" --batch
```

### Project Templates

```markdown
---
project: My New Project
author: {{author:Anonymous}}
date: {{date:TBD}}
repo: {{repo:github.com/user/repo}}
---

# {{project}}

**Author:** {{author}}
**Date:** {{date}}
**Repository:** {{repo}}
```

---

## Syntax Highlighting

Variables are automatically color-coded in your editor:

| Color | Status | Meaning |
|-------|--------|---------|
| Green | Exists | Variable has a value in frontmatter |
| Orange | Has Default | Variable not set but has a default value |
| Red | Missing | No value and no default |

Colors adapt to light/dark themes automatically (Catppuccin Latte/Mocha). Override with custom hex values in settings.

---

## Architecture

```
Tidemark/
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── esbuild.config.mjs                # esbuild bundler config
├── manifest.json                     # Obsidian plugin manifest
├── styles.css                        # Plugin styles
│
├── src/
│   ├── main.ts                       # Plugin entry point, command registration
│   ├── variableReplacer.ts           # Core replacement engine
│   ├── frontmatterParser.ts          # YAML frontmatter extraction and parsing
│   ├── decorationProvider.ts         # CodeMirror syntax highlighting decorations
│   ├── types.ts                      # TypeScript interfaces and types
│   │
│   ├── commands/                     # ── Command Handlers ──
│   │   └── ...                       # Copy, replace, list, rename commands
│   │
│   └── utils/                        # ── Utilities ──
│       └── ...                       # String helpers, YAML utilities
│
├── assets/                           # ── Repository Assets ──
│   └── banner.svg                    # Project banner (Catppuccin themed)
│
├── docs/                             # ── GitHub Pages ──
│   ├── index.html                    # Project website
│   └── assets/
│       ├── logo-dark.svg             # Logo for dark theme
│       └── logo-light.svg            # Logo for light theme
│
└── .github/
    └── workflows/                    # CI/CD pipelines
```

---

## Tips & Tricks

### Quick Command Execution

1. Write command templates in your note
2. Position cursor on command line
3. Use "Copy current line (replaced)" from the command palette
4. Paste in terminal
5. Execute

### Bulk Updates

Use **List all variables** to:
- See all variables at once
- Quickly identify missing values
- Edit multiple values in sequence

### Default Values Strategy

Use default values for common scenarios:

```
{{port:443}}
{{protocol:https}}
{{method:GET}}
{{timeout:30}}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Variables not highlighting | Ensure "Highlight Variables" is enabled in plugin settings |
| Variables not replacing | Check spelling (or enable case-insensitive); validate YAML syntax |
| Commands not showing | Ensure plugin is enabled; check Command Palette for "Tidemark" |
| Nested properties not resolving | Verify "Support Nested Properties" is enabled in settings |

---

## Platform Support

<table>
<tr>
<th>Capability</th>
<th>Desktop</th>
<th>Mobile (iOS)</th>
<th>Mobile (Android)</th>
</tr>
<tr>
<td>Variable Replacement</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
<tr>
<td>Copy to Clipboard</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
<tr>
<td>Syntax Highlighting</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
<tr>
<td>Context Menu</td>
<td>Full</td>
<td>Limited</td>
<td>Limited</td>
</tr>
<tr>
<td>Nested Properties</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
<tr>
<td>File Rename</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
</table>

---

## Security

### Vulnerability Reporting

**Report security issues via:**
- GitHub Security Advisories (preferred)
- Private disclosure to maintainers
- Responsible disclosure timeline (90 days)

**Do NOT:**
- Open public GitHub issues for vulnerabilities
- Disclose before coordination with maintainers

---

## License

MIT License

Copyright &copy; 2026 Real-Fruit-Snacks

```
THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
THE AUTHORS ARE NOT LIABLE FOR ANY DAMAGES ARISING FROM USE.
```

---

## Resources

- **GitHub**: [github.com/Real-Fruit-Snacks/Tidemark](https://github.com/Real-Fruit-Snacks/Tidemark)
- **Issues**: [Report a Bug](https://github.com/Real-Fruit-Snacks/Tidemark/issues)
- **Security**: [SECURITY.md](SECURITY.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

<div align="center">

**Part of the Real-Fruit-Snacks water-themed security toolkit**

[Aquifer](https://github.com/Real-Fruit-Snacks/Aquifer) • [armsforge](https://github.com/Real-Fruit-Snacks/armsforge) • [Cascade](https://github.com/Real-Fruit-Snacks/Cascade) • [Conduit](https://github.com/Real-Fruit-Snacks/Conduit) • [Deadwater](https://github.com/Real-Fruit-Snacks/Deadwater) • [Deluge](https://github.com/Real-Fruit-Snacks/Deluge) • [Depth](https://github.com/Real-Fruit-Snacks/Depth) • [Dew](https://github.com/Real-Fruit-Snacks/Dew) • [Droplet](https://github.com/Real-Fruit-Snacks/Droplet) • [Fathom](https://github.com/Real-Fruit-Snacks/Fathom) • [Flux](https://github.com/Real-Fruit-Snacks/Flux) • [Grotto](https://github.com/Real-Fruit-Snacks/Grotto) • [HydroShot](https://github.com/Real-Fruit-Snacks/HydroShot) • [LigoloSupport](https://github.com/Real-Fruit-Snacks/LigoloSupport) • [Maelstrom](https://github.com/Real-Fruit-Snacks/Maelstrom) • [Rapids](https://github.com/Real-Fruit-Snacks/Rapids) • [Ripple](https://github.com/Real-Fruit-Snacks/Ripple) • [Riptide](https://github.com/Real-Fruit-Snacks/Riptide) • [Runoff](https://github.com/Real-Fruit-Snacks/Runoff) • [Seep](https://github.com/Real-Fruit-Snacks/Seep) • [Shallows](https://github.com/Real-Fruit-Snacks/Shallows) • [Siphon](https://github.com/Real-Fruit-Snacks/Siphon) • [Slipstream](https://github.com/Real-Fruit-Snacks/Slipstream) • [Spillway](https://github.com/Real-Fruit-Snacks/Spillway) • [Sunken-Archive](https://github.com/Real-Fruit-Snacks/Sunken-Archive) • [Surge](https://github.com/Real-Fruit-Snacks/Surge) • **Tidemark** • [Tidepool](https://github.com/Real-Fruit-Snacks/Tidepool) • [Undercurrent](https://github.com/Real-Fruit-Snacks/Undercurrent) • [Undertow](https://github.com/Real-Fruit-Snacks/Undertow) • [Vapor](https://github.com/Real-Fruit-Snacks/Vapor) • [Wellspring](https://github.com/Real-Fruit-Snacks/Wellspring) • [Whirlpool](https://github.com/Real-Fruit-Snacks/Whirlpool)

*Remember: With great power comes great responsibility.*

</div>
