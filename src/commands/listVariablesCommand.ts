/**
 * List variables command - show all variables in a SuggestModal
 */

import { App, Editor, MarkdownView, SuggestModal } from 'obsidian';
import { parseFrontmatter, findFrontmatterEnd, buildFrontmatterBlock } from '../frontmatterParser';
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
        const dot = header.createSpan({ cls: 'tidemark-variable-dot' });
        dot.style.background = statusColor;
        header.createSpan({ text: variable.name, cls: 'tidemark-variable-name' });
        const badge = header.createSpan({ text: statusLabel, cls: 'tidemark-variable-badge' });
        badge.style.color = statusColor;

        const detail = container.createDiv({ cls: 'tidemark-variable-detail' });
        if (variable.status === 'exists') {
            detail.setText(`Value: ${String(variable.value)}`);
        } else if (variable.defaultValue) {
            detail.setText(`Default: ${variable.defaultValue}`);
        } else {
            detail.setText('No value set');
        }
    }

    onChooseSuggestion(variable: Variable): void {
        const editor = this.editor;
        const desc = variable.defaultValue ? `Default: ${variable.defaultValue}` : undefined;
        new SetValueModal(this.app, variable.name, variable.value != null ? String(variable.value) : '', variable.defaultValue || 'Enter value...', (newValue) => {
            try {
                const settings = getSettings();
                const content = editor.getValue();
                const { block, end } = buildFrontmatterBlock(content, {
                    [variable.name]: newValue
                }, settings.supportNestedProperties);
                editor.replaceRange(block, { line: 0, ch: 0 }, editor.offsetToPos(end));
                notify(`Updated ${variable.name} = ${newValue}`);
            } catch (error) {
                notify(error instanceof Error ? error.message : 'Failed to edit variable', 'error');
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
