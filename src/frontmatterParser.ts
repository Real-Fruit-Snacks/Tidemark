/**
 * Frontmatter parsing and manipulation
 */

import { parseYaml, stringifyYaml } from 'obsidian';
import { Frontmatter, FORBIDDEN_KEYS, MAX_ARRAY_INDEX } from './types';

/**
 * Coerce an unknown YAML parse result into a Frontmatter object.
 * Non-object results (scalars, arrays, null) become an empty object.
 */
function asFrontmatter(parsed: unknown): Frontmatter {
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Frontmatter)
        : {};
}

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
        return asFrontmatter(parseYaml(match[1]) as unknown);
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
 * Result of a strict frontmatter parse that distinguishes "no frontmatter"
 * from "frontmatter present but unusable" so callers can fail closed.
 */
export type FrontmatterParseResult =
    | { ok: true; data: Frontmatter }
    | { ok: false; reason: string };

/**
 * Parse frontmatter, reporting failure instead of silently returning {}.
 * A document with no frontmatter is a success with empty data; a document
 * with a broken or unclosed frontmatter block is a failure.
 */
export function parseFrontmatterStrict(text: string): FrontmatterParseResult {
    if (!text.startsWith('---')) {
        return { ok: true, data: {} };
    }

    const emptyMatch = text.match(/^---\r?\n---(?:\r?\n|$)/);
    if (emptyMatch) {
        return { ok: true, data: {} };
    }

    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) {
        return { ok: false, reason: 'Cannot update frontmatter: the block is not closed with an ending ---' };
    }

    try {
        return { ok: true, data: asFrontmatter(parseYaml(match[1]) as unknown) };
    } catch (e) {
        console.error('YAML parse error:', e);
        return { ok: false, reason: 'Cannot update frontmatter: it is not valid YAML' };
    }
}

/**
 * Build a replacement frontmatter block with the given updates applied.
 * Throws if the existing frontmatter cannot be parsed, so callers never
 * overwrite an unreadable block with a partial one. The returned `end` is
 * the offset in the original text where the old block ends (0 when the
 * document has no frontmatter yet).
 */
export function buildFrontmatterBlock(
    text: string,
    updates: Record<string, unknown>,
    supportNestedProperties: boolean = true
): { block: string; end: number } {
    const parsed = parseFrontmatterStrict(text);
    if (!parsed.ok) {
        throw new Error(parsed.reason);
    }

    const frontmatter = parsed.data;
    for (const [key, value] of Object.entries(updates)) {
        setNestedValue(frontmatter, key, value, supportNestedProperties);
    }

    const block = `---\n${stringifyYaml(frontmatter)}---\n`;
    const end = text.startsWith('---') ? findFrontmatterEnd(text) : 0;
    return { block, end };
}

/**
 * Set a nested value in an object (handles dot notation and arrays)
 */
export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown, supportNestedProperties: boolean = true): void {
    // When nested properties are disabled, do a direct key assignment
    if (!supportNestedProperties) {
        if (FORBIDDEN_KEYS.has(path.toLowerCase())) {
            return;
        }
        obj[path] = value;
        return;
    }

    const keys = path.split('.');
    let current: Record<string, unknown> = obj;

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
            const arr = current[propName] as unknown[];

            // Bounds check
            if (index > MAX_ARRAY_INDEX) {
                console.warn(`Array index ${index} exceeds maximum allowed (${MAX_ARRAY_INDEX})`);
                return;
            }

            // Ensure array is long enough
            while (arr.length <= index) {
                arr.push({});
            }

            // Ensure element is an object if we need to traverse deeper
            if (arr[index] === null || typeof arr[index] !== 'object') {
                arr[index] = {};
            }

            current = arr[index] as Record<string, unknown>;
        } else {
            // Regular property
            if (!(key in current)) {
                current[key] = {};
            } else if (typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            current = current[key] as Record<string, unknown>;
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
        const arr = current[propName] as unknown[];

        // Bounds check
        if (index > MAX_ARRAY_INDEX) {
            console.warn(`Array index ${index} exceeds maximum allowed (${MAX_ARRAY_INDEX})`);
            return;
        }

        // Ensure array is long enough
        while (arr.length <= index) {
            arr.push(null);
        }

        arr[index] = value;
    } else {
        // Simple assignment
        current[finalKey] = value;
    }
}
