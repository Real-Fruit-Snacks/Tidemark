/**
 * Rename file command - rename file with variables replaced
 */

import { App, Editor, MarkdownView } from 'obsidian';
import { parseFrontmatter } from '../frontmatterParser';
import { replaceVariables } from '../variableReplacer';
import { getSettings } from '../utils/settings';
import { notify } from '../utils/notifications';
import { sanitizeFilename } from '../utils/fileOperations';

/**
 * Rename file with variables replaced in the filename
 */
export async function renameFileWithVariables(app: App, editor: Editor, view: MarkdownView): Promise<void> {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);

        const file = view.file;
        if (!file) {
            notify('No file associated with this view', 'error');
            return;
        }

        // Get current filename without extension
        const currentName = file.basename;
        const extension = file.extension;

        // Replace variables in the filename
        const { result: newName, replacementCount, missingCount } = replaceVariables(currentName, frontmatter, settings);

        // Check if there were any variables to replace
        if (replacementCount === 0 && missingCount === 0) {
            notify('No variables found in filename', 'info');
            return;
        }

        // Check if the name actually changed
        if (newName === currentName) {
            notify('Filename unchanged after replacement', 'info');
            return;
        }

        // Sanitize the new filename
        const sanitizedName = sanitizeFilename(newName);

        if (!sanitizedName) {
            notify('Invalid filename after replacement', 'error');
            return;
        }

        // Build the new full path
        const parentPath = file.parent?.path || '';
        const newPath = parentPath
            ? `${parentPath}/${sanitizedName}.${extension}`
            : `${sanitizedName}.${extension}`;

        // Check if a file with this name already exists
        const existing = app.vault.getAbstractFileByPath(newPath);
        if (existing) {
            notify(`File already exists: ${sanitizedName}.${extension}`, 'error');
            return;
        }

        try {
            await app.fileManager.renameFile(file, newPath);
            notify(`Renamed to: ${sanitizedName}${missingCount > 0 ? ` (${missingCount} variable(s) not found)` : ''}`);
        } catch (err) {
            notify('Failed to rename file', 'error');
            console.error('Rename error:', err);
        }
    } catch (error) {
        notify('Failed to rename file', 'error');
        console.error('Rename file error:', error);
    }
}
