/**
 * Replace commands - permanently replace variables in document
 */

import { App, Editor, MarkdownView } from 'obsidian';
import { parseFrontmatter, findFrontmatterEnd } from '../frontmatterParser';
import { replaceVariables, scanDocumentVariables, buildVariableEdits, MAX_DOCUMENT_SIZE } from '../variableReplacer';
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

        if (content.length > MAX_DOCUMENT_SIZE) {
            notify('Document too large to process (over 1,000,000 characters)', 'error');
            return;
        }

        const frontmatter = parseFrontmatter(content);
        const frontmatterEnd = findFrontmatterEnd(content);
        const variables = scanDocumentVariables(content, frontmatter, frontmatterEnd, settings);

        // Skip if nothing to replace
        if (variables.length === 0) {
            notify('No variables found in document', 'info');
            return;
        }

        // Apply targeted edits in a single transaction so the cursor, scroll
        // position, and undo history are preserved.
        const { edits, replaced, missing } = buildVariableEdits(variables, settings);
        if (edits.length > 0) {
            editor.transaction({ changes: edits });
        }

        notify(`Replaced ${replaced} variable(s)${missing > 0 ? `, ${missing} not found` : ''}`);
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

        if (content.length > MAX_DOCUMENT_SIZE) {
            notify('Document too large to process (over 1,000,000 characters)', 'error');
            return;
        }

        const frontmatter = parseFrontmatter(content);

        // Calculate document replacements as targeted edits
        const frontmatterEnd = findFrontmatterEnd(content);
        const variables = scanDocumentVariables(content, frontmatter, frontmatterEnd, settings);
        const docEdits = buildVariableEdits(variables, settings);

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
        const hasDocChanges = variables.length > 0;
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

        // THEN MODIFY DOCUMENT with a single targeted transaction
        if (hasDocChanges && docEdits.edits.length > 0) {
            editor.transaction({ changes: docEdits.edits });
        }

        // Build notification message
        let msg = '';
        if (docEdits.replaced > 0) {
            msg += `Replaced ${docEdits.replaced} in document`;
        }
        if (filenameReplaced) {
            msg += msg ? ', ' : '';
            msg += `renamed to: ${newFilename}`;
        }
        if (docEdits.missing > 0) {
            msg += ` (${docEdits.missing} not found)`;
        }

        if (msg) {
            notify(msg);
        }
    } catch (error) {
        notify('Failed to replace variables', 'error');
        console.error('Replace in document and filename error:', error);
    }
}
