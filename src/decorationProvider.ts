/**
 * Decoration provider for variable syntax highlighting
 * Uses CodeMirror 6 ViewPlugin for Obsidian
 */

import {
    ViewUpdate,
    ViewPlugin,
    Decoration,
    DecorationSet,
    EditorView,
    PluginValue,
} from '@codemirror/view';
import { RangeSetBuilder, Text } from '@codemirror/state';
import { parseYaml } from 'obsidian';
import { getVariablePattern, getNestedValue } from './variableReplacer';
import { getSettings } from './utils/settings';
import { DEFAULT_HIGHLIGHT_COLORS, Frontmatter } from './types';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const MAX_FRONTMATTER_LINES = 5000;

/**
 * Convert hex color to rgba with alpha
 */
export function hexToRgba(hex: string, alpha: number): string {
    if (!hex || typeof hex !== 'string' || !hex.match(/^#[0-9A-Fa-f]{6}$/)) {
        return `rgba(128, 128, 128, ${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get the appropriate color for a variable state
 */
export function getColor(state: 'exists' | 'missing' | 'hasDefault'): string {
    const settings = getSettings();
    const custom = settings.highlightColors[state];
    if (typeof custom === 'string' && HEX_COLOR.test(custom.trim())) {
        return custom.trim();
    }
    const isDark = document.body.classList.contains('theme-dark');
    return DEFAULT_HIGHLIGHT_COLORS[state][isDark ? 'dark' : 'light'];
}

/**
 * A "---" fence line, tolerating a trailing carriage return on CRLF documents.
 */
function isFenceLine(text: string): boolean {
    return text === '---' || text === '---\r';
}

class TidemarkViewPlugin implements PluginValue {
    decorations: DecorationSet;
    private cachedFrontmatter: { end: number; data: Frontmatter } | null = null;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate): void {
        // Invalidate the cached frontmatter only when an edit touches the
        // frontmatter region (or the first line, which can open a new block).
        if (update.docChanged && this.cachedFrontmatter) {
            const boundary = Math.max(this.cachedFrontmatter.end, update.startState.doc.line(1).to);
            let touched = false;
            update.changes.iterChangedRanges((fromA) => {
                if (fromA <= boundary) {
                    touched = true;
                }
            });
            if (touched) {
                this.cachedFrontmatter = null;
            }
        }

        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    destroy(): void {
        // No cleanup needed
    }

    /**
     * Locate and parse the frontmatter block directly from the CodeMirror
     * document, returning the offset where it ends and its parsed values.
     */
    private computeFrontmatter(doc: Text): { end: number; data: Frontmatter } {
        if (doc.lines < 2 || !isFenceLine(doc.line(1).text)) {
            return { end: 0, data: {} };
        }

        const openTo = doc.line(1).to;
        const maxLine = Math.min(doc.lines, MAX_FRONTMATTER_LINES);
        for (let i = 2; i <= maxLine; i++) {
            const line = doc.line(i);
            if (isFenceLine(line.text)) {
                let data: Frontmatter = {};
                try {
                    data = (parseYaml(doc.sliceString(openTo + 1, line.from)) as Frontmatter) || {};
                } catch (e) {
                    console.error('YAML parse error:', e);
                    data = {};
                }
                return { end: Math.min(line.to + 1, doc.length), data };
            }
        }

        return { end: 0, data: {} };
    }

    buildDecorations(view: EditorView): DecorationSet {
        const settings = getSettings();

        if (!settings.highlightVariables) {
            return Decoration.none;
        }

        const doc = view.state.doc;
        if (!this.cachedFrontmatter) {
            this.cachedFrontmatter = this.computeFrontmatter(doc);
        }
        const frontmatter = this.cachedFrontmatter;

        const pattern = getVariablePattern(settings);
        const decos: { from: number; to: number; status: string }[] = [];

        // Only scan the ranges the editor is actually showing, skipping the
        // frontmatter block itself.
        for (const range of view.visibleRanges) {
            let from = doc.lineAt(range.from).from;
            const to = doc.lineAt(range.to).to;
            if (from < frontmatter.end) {
                from = frontmatter.end;
            }
            if (to <= from) {
                continue;
            }

            const slice = doc.sliceString(from, to);
            pattern.lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = pattern.exec(slice)) !== null) {
                const name = match[1].trim();
                const defaultValue = match[2];
                const value = getNestedValue(frontmatter.data, name, settings.caseInsensitive, settings.supportNestedProperties);

                let status: string;
                if (value !== undefined && value !== null && value !== '') {
                    status = 'exists';
                } else if (defaultValue !== undefined) {
                    status = 'has-default';
                } else {
                    status = 'missing';
                }

                decos.push({
                    from: from + match.index,
                    to: from + match.index + match[0].length,
                    status,
                });
            }
        }

        // Sort by from position (required by RangeSetBuilder)
        decos.sort((a, b) => a.from - b.from);

        const builder = new RangeSetBuilder<Decoration>();
        let lastTo = -1;

        for (const deco of decos) {
            // Guard against any overlapping ranges, which RangeSetBuilder rejects
            if (deco.from < lastTo) {
                continue;
            }
            lastTo = deco.to;

            let color: string;
            if (deco.status === 'exists') {
                color = getColor('exists');
            } else if (deco.status === 'has-default') {
                color = getColor('hasDefault');
            } else {
                color = getColor('missing');
            }

            builder.add(
                deco.from,
                deco.to,
                Decoration.mark({
                    attributes: {
                        style: `color: ${color}; background-color: ${hexToRgba(color, 0.15)}; border-radius: 3px;`,
                    },
                })
            );
        }

        return builder.finish();
    }
}

export const tidemarkViewPlugin = ViewPlugin.fromClass(TidemarkViewPlugin, {
    decorations: (v) => v.decorations,
});
