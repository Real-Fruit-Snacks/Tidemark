/**
 * List variables command - show all variables in a SuggestModal
 */

import { App, Editor, MarkdownView, SuggestModal } from 'obsidian';
import { parseFrontmatter, findFrontmatterEnd, updateFrontmatter } from '../frontmatterParser';
import { scanDocumentVariables } from '../variableReplacer';
import { getSettings } from '../utils/settings';
import { notify } from '../utils/notifications';
import { getColor } from '../decorationProvider';
import { SetValueModal } from './setVariableCommand';
import { Variable } from '../types';

/**
 * SuggestModal for listing and selecting variables
 */
class VariableSuggestModal extends SuggestModal<Variable> {
    variables: Variable[];
    editor: Editor;

    constructor(app: App, variables: Variable[], editor: Editor) {
        super(app);
        this.variables = variables;
        this.editor = editor;
        this.setPlaceholder('Select a variable to edit...');
    }

    getSuggestions(query: string): Variable[] {
        const lowerQuery = query.toLowerCase();
        return this.variables.filter(v =>
            v.name.toLowerCase().includes(lowerQuery)
        );
    }

    renderSuggestion(variable: Variable, el: HTMLElement): void {
        const container = el.createDiv({ cls: 'tidemark-variable-item' });

        // Status indicator — use theme-aware colors from settings/defaults
        let statusColor: string;
        let statusLabel: string;
        if (variable.status === 'exists') {
            statusColor = getColor('exists');
            statusLabel = 'SET';
        } else if (variable.status === 'has-default') {
            statusColor = getColor('hasDefault');
            statusLabel = 'DEFAULT';
        } else {
            statusColor = getColor('missing');
            statusLabel = 'MISSING';
        }

        const header = container.createDiv({ cls: 'tidemark-variable-header' });
        const indicator = header.createSpan();
        indicator.style.cssText = `display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusColor};margin-right:8px;`;
        header.createSpan({ text: variable.name, cls: 'tidemark-variable-name' });
        const badge = header.createSpan({ text: statusLabel });
        badge.style.cssText = `margin-left:auto;font-size:10px;color:${statusColor};opacity:0.8;`;

        // Value display
        const detail = container.createDiv();
        detail.style.cssText = 'font-size:12px;color:var(--text-muted);margin-top:2px;';
        if (variable.status === 'exists') {
            detail.setText(`Value: ${variable.value}`);
        } else if (variable.defaultValue) {
            detail.setText(`Default: ${variable.defaultValue}`);
        } else {
            detail.setText('No value set');
        }
    }

    onChooseSuggestion(variable: Variable): void {
        const editor = this.editor;
        const desc = variable.defaultValue ? `Default: ${variable.defaultValue}` : undefined;
        new SetValueModal(this.app, variable.name, variable.value?.toString() || '', variable.defaultValue || 'Enter value...', async (newValue) => {
            try {
                const settings = getSettings();
                const content = editor.getValue();
                const newText = updateFrontmatter(content, {
                    [variable.name]: newValue
                }, settings.supportNestedProperties);
                editor.setValue(newText);
                notify(`Updated ${variable.name} = ${newValue}`);
            } catch (error) {
                notify('Failed to edit variable', 'error');
                console.error('Edit variable error:', error);
            }
        }, desc).open();
    }
}

/**
 * List all variables in document
 */
export function listVariablesCommand(app: App, editor: Editor, _view: MarkdownView): void {
    try {
        const settings = getSettings();
        const content = editor.getValue();
        const frontmatter = parseFrontmatter(content);
        const frontmatterEnd = findFrontmatterEnd(content);

        // Scan for all variables
        const variables = scanDocumentVariables(content, frontmatter, frontmatterEnd, settings);

        if (variables.length === 0) {
            notify('No variables found in document', 'info');
            return;
        }

        // Sort: missing first, then has-default, then exists
        const statusOrder: Record<string, number> = {
            'missing': 0,
            'has-default': 1,
            'exists': 2,
            'frontmatter-only': 3,
        };
        variables.sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));

        new VariableSuggestModal(app, variables, editor).open();
    } catch (error) {
        notify('Failed to list variables', 'error');
        console.error('List variables error:', error);
    }
}
