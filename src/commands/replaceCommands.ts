/**
 * Replace commands - permanently replace variables in document
 */

import { App, Editor, MarkdownView } from 'obsidian';
import { parseFrontmatter, findFrontmatterEnd } from '../frontmatterParser';
import { replaceVariables } from '../variableReplacer';
import { getSettings } from '../utils/settings';
import { notify } from '../utils/notifications';
import { sanitizeFilename } from '../utils/fileOperations';

/**
 * Replace variables in selection (or current line if no selection)
 */
export function replaceInSelection(editor: Editor, _view: MarkdownView): void {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);

        const selection = editor.getSelection();

        if (!selection || selection.length === 0) {
            // No selection - replace current line
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const { result, replacementCount, missingCount } = replaceVariables(line, frontmatter, settings);

            if (replacementCount === 0 && missingCount === 0) {
                notify('No variables found in line', 'info');
                return;
            }

            editor.setLine(cursor.line, result);
            notify(`Replaced ${replacementCount} variable(s)${missingCount > 0 ? `, ${missingCount} not found` : ''}`);
        } else {
            // Replace in selection
            const { result, replacementCount, missingCount } = replaceVariables(selection, frontmatter, settings);

            if (replacementCount === 0 && missingCount === 0) {
                notify('No variables found in selection', 'info');
                return;
            }

            editor.replaceSelection(result);
            notify(`Replaced ${replacementCount} variable(s)${missingCount > 0 ? `, ${missingCount} not found` : ''}`);
        }
    } catch (error) {
        notify('Failed to replace variables', 'error');
        console.error('Replace in selection error:', error);
    }
}

/**
 * Replace all variables in document
 */
export function replaceInDocument(editor: Editor, _view: MarkdownView): void {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);

        // Find the end of frontmatter to avoid replacing in YAML
        const frontmatterEnd = findFrontmatterEnd(content);
        const bodyPart = content.slice(frontmatterEnd);

        const { result, replacementCount, missingCount } = replaceVariables(bodyPart, frontmatter, settings);

        // Skip if nothing to replace
        if (replacementCount === 0 && missingCount === 0) {
            notify('No variables found in document', 'info');
            return;
        }

        // Save cursor position
        const cursor = editor.getCursor();

        // Replace only the body part (after frontmatter)
        const newContent = content.slice(0, frontmatterEnd) + result;
        editor.setValue(newContent);

        // Restore cursor position (clamped to valid range)
        const lastLine = editor.lastLine();
        const newLine = Math.min(cursor.line, lastLine);
        const lineLength = editor.getLine(newLine).length;
        const newChar = Math.min(cursor.ch, lineLength);
        editor.setCursor({ line: newLine, ch: newChar });

        notify(`Replaced ${replacementCount} variable(s)${missingCount > 0 ? `, ${missingCount} not found` : ''}`);
    } catch (error) {
        notify('Failed to replace variables', 'error');
        console.error('Replace in document error:', error);
    }
}

/**
 * Replace all variables in document and filename
 */
export async function replaceInDocumentAndFilename(app: App, editor: Editor, view: MarkdownView): Promise<void> {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);

        // Calculate document replacements
        const frontmatterEnd = findFrontmatterEnd(content);
        const bodyPart = content.slice(frontmatterEnd);
        const docResult = replaceVariables(bodyPart, frontmatter, settings);

        // Calculate filename replacements
        const file = view.file;
        if (!file) {
            notify('No file associated with this view', 'error');
            return;
        }
        const currentName = file.basename;
        const extension = file.extension;
        const filenameResult = replaceVariables(currentName, frontmatter, settings);

        let filenameReplaced = false;
        let newFilename = '';

        // Check if there's anything to do
        const hasDocChanges = docResult.replacementCount > 0 || docResult.missingCount > 0;
        const hasFilenameChanges = filenameResult.replacementCount > 0 && filenameResult.result !== currentName;

        if (!hasDocChanges && !hasFilenameChanges) {
            notify('No variables found', 'info');
            return;
        }

        // RENAME FIRST (for atomicity)
        if (hasFilenameChanges) {
            const sanitizedName = sanitizeFilename(filenameResult.result);

            if (sanitizedName) {
                const parentPath = file.parent?.path || '';
                const newPath = parentPath
                    ? `${parentPath}/${sanitizedName}.${extension}`
                    : `${sanitizedName}.${extension}`;

                // Check if file already exists
                const existing = app.vault.getAbstractFileByPath(newPath);
                if (existing) {
                    notify(`Cannot rename: file "${sanitizedName}.${extension}" already exists`, 'error');
                    return;
                }

                try {
                    await app.fileManager.renameFile(file, newPath);
                    filenameReplaced = true;
                    newFilename = sanitizedName;
                } catch (err) {
                    notify('Failed to rename file', 'error');
                    console.error('Rename error:', err);
                    return;
                }
            }
        }

        // THEN MODIFY DOCUMENT
        if (hasDocChanges) {
            const cursor = editor.getCursor();
            const newContent = content.slice(0, frontmatterEnd) + docResult.result;
            editor.setValue(newContent);

            // Restore cursor
            const lastLine = editor.lastLine();
            const newLine = Math.min(cursor.line, lastLine);
            const lineLength = editor.getLine(newLine).length;
            const newChar = Math.min(cursor.ch, lineLength);
            editor.setCursor({ line: newLine, ch: newChar });
        }

        // Build notification message
        let msg = '';
        if (docResult.replacementCount > 0) {
            msg += `Replaced ${docResult.replacementCount} in document`;
        }
        if (filenameReplaced) {
            msg += msg ? ', ' : '';
            msg += `renamed to: ${newFilename}`;
        }
        if (docResult.missingCount > 0) {
            msg += ` (${docResult.missingCount} not found)`;
        }

        if (msg) {
            notify(msg);
        }
    } catch (error) {
        notify('Failed to replace variables', 'error');
        console.error('Replace in document and filename error:', error);
    }
}
