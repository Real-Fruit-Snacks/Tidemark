/**
 * Tidemark - Obsidian Plugin
 * Replace {{variables}} with YAML frontmatter values on demand
 */

import { Plugin, MarkdownView, MarkdownFileInfo, Menu, Editor } from 'obsidian';
import { tidemarkViewPlugin } from './decorationProvider';
import { copyLineReplaced, copySelectionReplaced, copyDocumentReplaced } from './commands/copyCommands';
import { replaceInSelection, replaceInDocument, replaceInDocumentAndFilename } from './commands/replaceCommands';
import { renameFileWithVariables } from './commands/renameCommand';
import { setVariableCommand } from './commands/setVariableCommand';
import { listVariablesCommand } from './commands/listVariablesCommand';
import { initSettings, onSettingsChange, TidemarkSettingTab } from './utils/settings';
import { invalidatePatternCache } from './variableReplacer';

/**
 * Helper to extract MarkdownView from editorCallback context
 */
function getMarkdownView(ctx: MarkdownView | MarkdownFileInfo): MarkdownView | null {
    if (ctx instanceof MarkdownView) {
        return ctx;
    }
    return null;
}

export default class TidemarkPlugin extends Plugin {
    async onload(): Promise<void> {
        // Load settings
        initSettings(this, await this.loadData());

        // Register settings tab
        this.addSettingTab(new TidemarkSettingTab(this.app, this));

        // Register editor extension for syntax highlighting
        this.registerEditorExtension([tidemarkViewPlugin]);

        // Watch for settings changes to refresh decorations
        onSettingsChange(() => {
            invalidatePatternCache();
            // Force re-render of editor extensions
            this.app.workspace.updateOptions();
        });

        // --- Copy Commands ---
        this.addCommand({
            id: 'copy-line-replaced',
            name: 'Copy current line (replaced)',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) copyLineReplaced(editor, view);
            },
        });

        this.addCommand({
            id: 'copy-selection-replaced',
            name: 'Copy selection (replaced)',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) copySelectionReplaced(editor, view);
            },
        });

        this.addCommand({
            id: 'copy-document-replaced',
            name: 'Copy document (replaced)',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) copyDocumentReplaced(editor, view);
            },
        });

        // --- Replace Commands ---
        this.addCommand({
            id: 'replace-in-selection',
            name: 'Replace in selection',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) replaceInSelection(editor, view);
            },
        });

        this.addCommand({
            id: 'replace-in-document',
            name: 'Replace all in document',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) replaceInDocument(editor, view);
            },
        });

        this.addCommand({
            id: 'replace-in-document-and-filename',
            name: 'Replace in document and filename',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) replaceInDocumentAndFilename(this.app, editor, view);
            },
        });

        // --- File Commands ---
        this.addCommand({
            id: 'rename-file',
            name: 'Rename file (replace variables)',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) renameFileWithVariables(this.app, editor, view);
            },
        });

        // --- Variable Management ---
        this.addCommand({
            id: 'list-variables',
            name: 'List all variables',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) listVariablesCommand(this.app, editor, view);
            },
        });

        this.addCommand({
            id: 'set-variable',
            name: 'Set variable value',
            editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
                const view = getMarkdownView(ctx);
                if (view) setVariableCommand(this.app, editor, view);
            },
        });

        // --- Context Menu ---
        this.registerEvent(
            // @ts-expect-error - editor-menu is a valid Obsidian workspace event not in type defs
            this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor, view: MarkdownView) => {
                menu.addItem((item) => {
                    item.setTitle('Tidemark: Set variable value')
                        .setIcon('pencil')
                        .onClick(() => {
                            setVariableCommand(this.app, editor, view);
                        });
                });
            })
        );
    }

    onunload(): void {
        // Cleanup handled by Obsidian registration system
    }
}
