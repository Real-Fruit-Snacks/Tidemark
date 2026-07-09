/**
 * Type definitions for Tidemark
 */

export interface PluginSettings {
    openDelimiter: string;
    closeDelimiter: string;
    defaultSeparator: string;
    missingValueText: string;
    supportNestedProperties: boolean;
    caseInsensitive: boolean;
    arrayJoinSeparator: string;
    preserveOriginalOnMissing: boolean;
    notificationLevel: 'all' | 'errors' | 'none';
    highlightVariables: boolean;
    highlightColors: {
        exists: string;
        missing: string;
        hasDefault: string;
    };
}

export interface Variable {
    name: string;
    value: unknown;
    defaultValue?: string;
    status: 'exists' | 'missing' | 'has-default' | 'frontmatter-only';
    position?: {
        line: number;
        start: number;
        end: number;
    };
    fullMatch?: string;
}

export interface Frontmatter {
    [key: string]: unknown;
}

export interface ReplacementResult {
    result: string;
    replacementCount: number;
    missingCount: number;
}

export interface EditorPositionLike {
    line: number;
    ch: number;
}

export interface VariableEdit {
    from: EditorPositionLike;
    to: EditorPositionLike;
    text: string;
}

export interface VariableEditResult {
    edits: VariableEdit[];
    replaced: number;
    missing: number;
}

export const DEFAULT_SETTINGS: PluginSettings = {
    openDelimiter: '{{',
    closeDelimiter: '}}',
    defaultSeparator: ':',
    missingValueText: '[MISSING]',
    supportNestedProperties: true,
    caseInsensitive: false,
    arrayJoinSeparator: ', ',
    preserveOriginalOnMissing: false,
    notificationLevel: 'all',
    highlightVariables: true,
    highlightColors: {
        exists: '',
        missing: '',
        hasDefault: ''
    }
};

// Default colors for variable state highlighting (Terminal Workbench)
export const DEFAULT_HIGHLIGHT_COLORS = {
    exists: { light: '#007a4d', dark: '#63f2ab' },
    missing: { light: '#c8324c', dark: '#ff6e7a' },
    hasDefault: { light: '#a46600', dark: '#f0c674' }
};

// Forbidden keys to prevent prototype pollution
export const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Maximum allowed array index to prevent unbounded array creation
export const MAX_ARRAY_INDEX = 1000;
