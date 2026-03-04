/**
 * Set variable command - context menu / command to set variable value
 */

import { App, Editor, MarkdownView, Modal, Setting } from 'obsidian';
import { parseFrontmatter, updateFrontmatter } from '../frontmatterParser';
import { getVariableAtPosition, getNestedValue } from '../variableReplacer';
import { getSettings } from '../utils/settings';
import { notify } from '../utils/notifications';

/**
 * Modal for setting a variable value (shared across commands)
 */
export class SetValueModal extends Modal {
    variableName: string;
    currentValue: string;
    placeholder: string;
    description: string;
    onSubmit: (value: string) => void;

    constructor(app: App, variableName: string, currentValue: string, placeholder: string, onSubmit: (value: string) => void, description?: string) {
        super(app);
        this.variableName = variableName;
        this.currentValue = currentValue;
        this.placeholder = placeholder;
        this.description = description || '';
        this.onSubmit = onSubmit;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.createEl('h3', { text: `Set value for: ${this.variableName}` });

        let inputValue = this.currentValue;

        const setting = new Setting(contentEl)
            .setName('Value');
        if (this.description) {
            setting.setDesc(this.description);
        }
        setting.addText(text => {
            text.setValue(this.currentValue)
                .setPlaceholder(this.placeholder)
                .onChange(value => {
                    inputValue = value;
                });
            setTimeout(() => text.inputEl.focus(), 50);
            text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.close();
                    this.onSubmit(inputValue);
                }
            });
        });

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Save')
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(inputValue);
                }));
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * Set variable value from context menu or command
 */
export function setVariableCommand(app: App, editor: Editor, _view: MarkdownView): void {
    try {
        const settings = getSettings();
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);

        // Find variable at cursor position
        const variable = getVariableAtPosition(line, cursor.ch, settings);

        if (!variable) {
            notify('No variable at cursor position', 'info');
            return;
        }

        // Get frontmatter to check current value
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);
        const currentValue = getNestedValue(frontmatter, variable.name, settings.caseInsensitive, settings.supportNestedProperties);

        new SetValueModal(
            app,
            variable.name,
            currentValue?.toString() || '',
            'Enter value...',
            (newValue) => {
                try {
                    const latestContent = editor.getValue();
                    const newText = updateFrontmatter(latestContent, {
                        [variable.name]: newValue
                    }, settings.supportNestedProperties);
                    editor.setValue(newText);
                    notify(`Set ${variable.name} = ${newValue}`);
                } catch (error) {
                    notify('Failed to set variable value', 'error');
                    console.error('Set variable error:', error);
                }
            }
        ).open();
    } catch (error) {
        notify('Failed to set variable value', 'error');
        console.error('Set variable error:', error);
    }
}
