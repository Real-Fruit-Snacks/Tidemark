<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-light.svg">
  <img alt="Tidemark" src="https://raw.githubusercontent.com/Real-Fruit-Snacks/Tidemark/main/docs/assets/logo-dark.svg" width="520">
</picture>

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Obsidian-7C3AED)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Obsidian plugin for variable substitution in markdown via YAML frontmatter**

Define variables in YAML frontmatter, reference them with `{{variable}}` syntax anywhere in your
document, then copy or replace with a single command. Supports nested properties, arrays, default
values, and syntax highlighting.

</div>

---

## Quick Start

### Install

**Community Plugins (recommended):**

1. Open Obsidian Settings > Community Plugins
2. Click "Browse" and search for "Tidemark"
3. Click Install, then Enable

**Manual:**

```bash
# Download main.js, manifest.json, styles.css from latest release
# Copy to .obsidian/plugins/tidemark/
```

### Build from Source

Prerequisites: Node.js 18+.

```bash
git clone https://github.com/Real-Fruit-Snacks/Tidemark.git
cd Tidemark

npm install
npm run build

# Copy to your vault
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/tidemark/
```

### Verify

```
1. Enable the plugin in Obsidian Settings > Community Plugins
2. Create a note with YAML frontmatter variables
3. Open Command Palette (Ctrl+P) > "Tidemark: Copy current line (replaced)"
```

---

## Features

### Variable Replacement

Define variables in YAML frontmatter and reference them with `{{variable}}` syntax. Copy to clipboard or permanently replace in-document with a single command.

```markdown
---
target_ip: 10.10.10.1
port: 8080
user: admin
---

# Recon

nmap -sV -sC {{target_ip}}
curl http://{{target_ip}}:{{port}}
ssh {{user}}@{{target_ip}}
```

### Default Values

Provide fallback values with the `:` separator. If the variable is not defined in frontmatter, the default is used instead.

```markdown
{{port:443}}          # uses 443 if port not in frontmatter
{{protocol:https}}    # uses https if not defined
{{username:root}}     # uses root if not defined
```

### Nested Properties

Access nested YAML structures with dot notation. Array values are automatically joined.

```markdown
---
server:
  ip: 10.10.10.1
  port: 8080
credentials:
  user: admin
  pass: hunter2
ports:
  - 22
  - 80
  - 443
---

curl http://{{server.ip}}:{{server.port}}
ssh {{credentials.user}}@{{server.ip}}
Open ports: {{ports}}
# Result: Open ports: 22, 80, 443
```

### Syntax Highlighting

Variables are color-coded in the editor for instant visual feedback:

```
Green   →  variable has a value in frontmatter
Orange  →  variable not set but has a default value
Red     →  no value and no default (missing)
```

Colors adapt to light and dark themes automatically. Override with custom hex values in settings.

### Commands

Access via Command Palette (Ctrl/Cmd+P), then type "Tidemark":

```
Copy current line (replaced)       →  copy line with variables filled
Copy selection (replaced)          →  copy selection with variables filled
Copy document (replaced)           →  copy entire note with variables filled
Replace in selection               →  permanently replace in selection
Replace all in document            →  replace all variables in body
Replace in document and filename   →  replace in body and rename file
Rename file (replace variables)    →  rename file with variables filled
List all variables                 →  view/edit all variables by status
Set variable value                 →  set value at cursor position
```

### Variable List

The "List all variables" command opens a panel showing every variable grouped by status. Edit values inline, navigate to variable locations in the document, and see which variables are missing at a glance.

### Context Menu

Right-click any highlighted variable to set its value directly from the context menu without opening settings or the command palette.

### Configuration

All settings accessible via Obsidian Settings > Community Plugins > Tidemark:

```
Delimiters:
  openDelimiter       →  {{ (default)
  closeDelimiter      →  }} (default)
  defaultSeparator    →  :  (default)

Behavior:
  missingValueText    →  [MISSING]
  supportNested       →  true
  caseInsensitive     →  false
  arrayJoinSeparator  →  ", "
  preserveOnMissing   →  false
  notificationLevel   →  all | errors | none

Visual:
  highlightVariables  →  true
  custom colors       →  per-status hex overrides
```

---

## Use Cases

### Pentesting Workflow

Create template notes for different target types. Fill in frontmatter, then copy commands with values already substituted:

```markdown
---
IPAddress: 10.10.10.50
hostname: target.htb
wordlist: /usr/share/wordlists/dirb/common.txt
---

nmap -sV -sC {{IPAddress}}
nikto -h {{IPAddress}}
gobuster dir -u http://{{IPAddress}} -w {{wordlist}}
echo "{{IPAddress}} {{hostname}}" >> /etc/hosts
```

### CTF Notes

```markdown
---
challenge: Web Exploitation 101
flag: CTF{not_found_yet}
url: http://ctf.example.com
---

# {{challenge}}

Target: {{url}}
curl {{url}}/robots.txt
sqlmap -u "{{url}}/login" --batch
Flag: {{flag}}
```

### Reusable Templates

```markdown
---
project: My Project
author: {{author:Anonymous}}
date: {{date:TBD}}
---

# {{project}}

**Author:** {{author}}
**Date:** {{date}}
```

---

## Architecture

```
Tidemark/
├── src/
│   ├── main.ts                # Plugin entry point, command registration
│   ├── variableReplacer.ts    # Core replacement engine
│   ├── frontmatterParser.ts   # YAML frontmatter extraction
│   ├── decorationProvider.ts  # CodeMirror syntax highlighting
│   ├── types.ts               # TypeScript interfaces
│   ├── commands/              # Command handlers
│   └── utils/                 # String helpers, YAML utilities
├── manifest.json              # Obsidian plugin manifest
├── esbuild.config.mjs         # Build configuration
└── docs/                      # GitHub Pages site
```

TypeScript plugin built with esbuild. The core replacement engine parses YAML frontmatter, resolves variable references (including nested dot-notation and array joins), and provides CodeMirror decorations for real-time syntax highlighting in the editor.

---

## Platform Support

| Capability | Desktop | iOS | Android |
|------------|---------|-----|---------|
| Variable Replacement | Full | Full | Full |
| Copy to Clipboard | Full | Full | Full |
| Syntax Highlighting | Full | Full | Full |
| Nested Properties | Full | Full | Full |
| Context Menu | Full | Limited | Limited |
| File Rename | Full | Full | Full |

---

## License

[MIT](LICENSE) — Copyright 2026 Real-Fruit-Snacks
