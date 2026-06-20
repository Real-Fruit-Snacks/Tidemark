/**
 * Copy commands - copy text with variables replaced
 */

import { Editor, MarkdownView } from 'obsidian';
import { parseFrontmatter, findFrontmatterEnd } from '../frontmatterParser';
import { replaceVariables } from '../variableReplacer';
import { getSettings } from '../utils/settings';
import { notify } from '../utils/notifications';

/**
 * Copy current line with variables replaced
 */
export async function copyLineReplaced(editor: Editor, _view: MarkdownView): Promise<void> {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);

        const { result, replacementCount } = replaceVariables(line, frontmatter, settings);

        await navigator.clipboard.writeText(result);
        notify(`Copied line (${replacementCount} variable(s) replaced)`);
    } catch (error) {
        notify('Failed to copy to clipboard', 'error');
        console.error('Copy line error:', error);
    }
}

/**
 * Copy selection with variables replaced
 */
export async function copySelectionReplaced(editor: Editor, _view: MarkdownView): Promise<void> {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);
        const selection = editor.getSelection();

        if (!selection || selection.length === 0) {
            // Fall back to current line
            return copyLineReplaced(editor, _view);
        }

        const { result, replacementCount } = replaceVariables(selection, frontmatter, settings);

        await navigator.clipboard.writeText(result);
        notify(`Copied selection (${replacementCount} variable(s) replaced)`);
    } catch (error) {
        notify('Failed to copy to clipboard', 'error');
        console.error('Copy selection error:', error);
    }
}

/**
 * Copy entire document with variables replaced
 */
export async function copyDocumentReplaced(editor: Editor, _view: MarkdownView): Promise<void> {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);

        // Find the end of frontmatter
        const frontmatterEnd = findFrontmatterEnd(content);
        const bodyPart = content.slice(frontmatterEnd);

        const { result, replacementCount } = replaceVariables(bodyPart, frontmatter, settings);

        await navigator.clipboard.writeText(result);
        notify(`Copied document (${replacementCount} variable(s) replaced)`);
    } catch (error) {
        notify('Failed to copy to clipboard', 'error');
        console.error('Copy document error:', error);
    }
}
