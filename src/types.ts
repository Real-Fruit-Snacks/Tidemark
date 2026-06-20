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
    value: any;
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
    [key: string]: any;
}

export interface ReplacementResult {
    result: string;
    replacementCount: number;
    missingCount: number;
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

// Default colors for variable state highlighting (Catppuccin Latte/Mocha)
export const DEFAULT_HIGHLIGHT_COLORS = {
    exists: { light: '#40a02b', dark: '#a6e3a1' },
    missing: { light: '#d20f39', dark: '#f38ba8' },
    hasDefault: { light: '#df8e1d', dark: '#f9e2af' }
};

// Forbidden keys to prevent prototype pollution
export const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Maximum allowed array index to prevent unbounded array creation
export const MAX_ARRAY_INDEX = 1000;
