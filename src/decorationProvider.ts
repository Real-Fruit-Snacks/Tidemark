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
import { RangeSetBuilder } from '@codemirror/state';
import { parseFrontmatter, findFrontmatterEnd } from './frontmatterParser';
import { scanDocumentVariables } from './variableReplacer';
import { getSettings } from './utils/settings';
import { DEFAULT_HIGHLIGHT_COLORS } from './types';

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
    if (settings.highlightColors[state]) {
        return settings.highlightColors[state];
    }
    const isDark = document.body.classList.contains('theme-dark');
    return DEFAULT_HIGHLIGHT_COLORS[state][isDark ? 'dark' : 'light'];
}

class TidemarkViewPlugin implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    destroy(): void {
        // No cleanup needed
    }

    buildDecorations(view: EditorView): DecorationSet {
        const settings = getSettings();

        if (!settings.highlightVariables) {
            return Decoration.none;
        }

        const text = view.state.doc.toString();
        const frontmatter = parseFrontmatter(text);
        const frontmatterEnd = findFrontmatterEnd(text);

        const variables = scanDocumentVariables(text, frontmatter, frontmatterEnd, settings);

        if (variables.length === 0) {
            return Decoration.none;
        }

        // We need to sort decorations by position (from) for RangeSetBuilder
        const decos: { from: number; to: number; status: string }[] = [];

        for (const variable of variables) {
            if (!variable.position) {
                continue;
            }

            // Convert line/character position to absolute offset
            // variable.position.line is 0-indexed
            const lineNum = variable.position.line + 1; // doc.line is 1-indexed
            if (lineNum < 1 || lineNum > view.state.doc.lines) {
                continue;
            }
            const line = view.state.doc.line(lineNum);
            const from = line.from + variable.position.start;
            const to = line.from + variable.position.end;

            // Bounds check
            if (from < 0 || to > view.state.doc.length || from >= to) {
                continue;
            }

            decos.push({ from, to, status: variable.status });
        }

        // Sort by from position (required by RangeSetBuilder)
        decos.sort((a, b) => a.from - b.from);

        const builder = new RangeSetBuilder<Decoration>();

        for (const deco of decos) {
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
