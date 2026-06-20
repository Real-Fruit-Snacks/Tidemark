/**
 * Frontmatter parsing and manipulation
 */

import * as yaml from 'js-yaml';
import { Frontmatter, FORBIDDEN_KEYS, MAX_ARRAY_INDEX } from './types';

/**
 * Parse frontmatter from document text
 */
export function parseFrontmatter(text: string): Frontmatter {
    // Check for frontmatter
    if (!text.startsWith('---')) {
        return {};
    }

    // Handle empty frontmatter: ---\n--- or ---\r\n---
    const emptyMatch = text.match(/^---\r?\n---(?:\r?\n|$)/);
    if (emptyMatch) {
        return {};
    }

    // Parse frontmatter block
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
        return {};
    }

    try {
        return (yaml.load(match[1], { schema: yaml.DEFAULT_SCHEMA }) as Frontmatter) || {};
    } catch (e) {
        console.error('YAML parse error:', e);
        return {};
    }
}

/**
 * Find the byte offset where frontmatter ends
 */
export function findFrontmatterEnd(text: string): number {
    // Frontmatter must start with --- at the beginning of the file
    if (!text.startsWith('---')) {
        return 0;
    }

    // Handle empty frontmatter: ---\n--- or ---\r\n---
    const emptyMatch = text.match(/^---\r?\n---(?:\r?\n|$)/);
    if (emptyMatch) {
        return emptyMatch[0].length;
    }

    // Match complete frontmatter block: opening ---, content, closing --- on its own line
    const match = text.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
    if (!match) {
        return 0;
    }

    return match[0].length;
}

/**
 * Update frontmatter with new values
 * Returns new full document text with updated frontmatter
 */
export function updateFrontmatter(
    text: string,
    updates: Record<string, any>,
    supportNestedProperties: boolean = true
): string {
    const hasFrontmatter = text.startsWith('---');

    const frontmatter = parseFrontmatter(text);

    // Apply updates
    for (const [key, value] of Object.entries(updates)) {
        setNestedValue(frontmatter, key, value, supportNestedProperties);
    }

    // Stringify
    const newFmContent = yaml.dump(frontmatter);
    const newFmBlock = `---\n${newFmContent}---\n`;

    if (hasFrontmatter) {
        // Replace existing
        const fmEnd = findFrontmatterEnd(text);
        return newFmBlock + text.slice(fmEnd);
    } else {
        // Insert new
        return newFmBlock + text;
    }
}

/**
 * Set a nested value in an object (handles dot notation and arrays)
 */
export function setNestedValue(obj: any, path: string, value: any, supportNestedProperties: boolean = true): void {
    // When nested properties are disabled, do a direct key assignment
    if (!supportNestedProperties) {
        if (FORBIDDEN_KEYS.has(path.toLowerCase())) {
            return;
        }
        obj[path] = value;
        return;
    }

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        // Guard against prototype pollution
        if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
            return;
        }

        // Handle array index notation like "items[0]"
        const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
            const propName = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);

            if (FORBIDDEN_KEYS.has(propName.toLowerCase())) {
                return;
            }

            // Ensure array exists
            if (!(propName in current) || !Array.isArray(current[propName])) {
                current[propName] = [];
            }

            // Bounds check
            if (index > MAX_ARRAY_INDEX) {
                console.warn(`Array index ${index} exceeds maximum allowed (${MAX_ARRAY_INDEX})`);
                return;
            }

            // Ensure array is long enough
            while (current[propName].length <= index) {
                current[propName].push({});
            }

            // Ensure element is an object if we need to traverse deeper
            if (current[propName][index] === null || typeof current[propName][index] !== 'object') {
                current[propName][index] = {};
            }

            current = current[propName][index];
        } else {
            // Regular property
            if (!(key in current)) {
                current[key] = {};
            } else if (typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            current = current[key];
        }
    }

    // Handle the final key
    const finalKey = keys[keys.length - 1];

    // Guard against prototype pollution
    if (FORBIDDEN_KEYS.has(finalKey.toLowerCase())) {
        return;
    }

    // Check if final key has array notation
    const finalArrayMatch = finalKey.match(/^(\w+)\[(\d+)\]$/);
    if (finalArrayMatch) {
        const propName = finalArrayMatch[1];
        const index = parseInt(finalArrayMatch[2]);

        if (FORBIDDEN_KEYS.has(propName.toLowerCase())) {
            return;
        }

        // Ensure array exists
        if (!(propName in current) || !Array.isArray(current[propName])) {
            current[propName] = [];
        }

        // Bounds check
        if (index > MAX_ARRAY_INDEX) {
            console.warn(`Array index ${index} exceeds maximum allowed (${MAX_ARRAY_INDEX})`);
            return;
        }

        // Ensure array is long enough
        while (current[propName].length <= index) {
            current[propName].push(null);
        }

        current[propName][index] = value;
    } else {
        // Simple assignment
        current[finalKey] = value;
    }
}
