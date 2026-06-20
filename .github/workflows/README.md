# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating the build, test, and release process of the Tidemark Obsidian plugin.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
- Runs on Ubuntu, Windows, and macOS
- Installs dependencies
- Lints the code
- Builds the plugin (`npm run build`)
- Runs tests
- Uploads plugin artifacts (main.js, manifest.json, styles.css)

**Usage:**
- Automatically runs on every push and PR
- No manual action required
- Download built artifacts from the Actions tab

### 2. Release Workflow (`release.yml`)

**Triggers:**
- Push of version tags (e.g., `v1.0.0`, `v1.2.3`)
- Manual workflow dispatch with version input

**What it does:**
- Installs dependencies
- Lints and builds the plugin
- Runs tests
- Creates a GitHub Release with `main.js`, `manifest.json`, and `styles.css`

**Usage - Automatic Release:**
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

**Usage - Manual Release:**
1. Go to the "Actions" tab in GitHub
2. Select "Release" workflow
3. Click "Run workflow"
4. Enter the version number (e.g., `1.0.0`)
5. Click "Run workflow"

## Plugin Artifacts

Release and CI builds produce three files:
- `main.js` — bundled plugin code
- `manifest.json` — Obsidian plugin manifest
- `styles.css` — plugin styles

These are the files users need to install the plugin manually.

## Troubleshooting

### Workflow fails on lint
- Run `npm run lint` locally to see errors
- Fix linting issues and push changes

### Workflow fails on build
- Run `npm run build` locally to see TypeScript errors
- Fix compilation errors and push changes

### Release not created
- Verify the tag follows the pattern `v*.*.*` (e.g., `v1.0.0`)
- Check the Actions tab for error messages
- Ensure GitHub token has proper permissions

## Local Testing

Before pushing, test the workflows locally:

```bash
# Install dependencies
npm ci

# Lint
npm run lint

# Build
npm run build

# Test
npm test
```

## Version Bumping

To create a new release:

```bash
# Update version in package.json and manifest.json
# Update versions.json with new mapping

# Commit and tag
git add -A
git commit -m "Release v1.0.0"
git tag v1.0.0

# Push with tags
git push && git push --tags
```

The release workflow will automatically create a GitHub release when the tag is pushed.
