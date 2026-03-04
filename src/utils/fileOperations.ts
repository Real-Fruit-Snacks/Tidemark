/**
 * File operation utilities
 */

/**
 * Sanitize filename by removing/replacing invalid characters
 */
export function sanitizeFilename(name: string): string | null {
    if (!name) {
        return null;
    }

    // Remove characters that are invalid in filenames across platforms
    // Windows: \ / : * ? " < > |
    // Also remove leading/trailing spaces and dots
    let sanitized = name
        .replace(/[\\/:*?"<>|]/g, '-')  // Replace invalid chars with dash
        .replace(/\s+/g, ' ')            // Collapse multiple spaces
        .trim()                          // Remove leading/trailing spaces
        .replace(/^\.+|\.+$/g, '');      // Remove leading/trailing dots

    // Check for Windows reserved names
    const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
    if (WINDOWS_RESERVED.test(sanitized)) {
        sanitized = '_' + sanitized;
    }

    // Ensure the filename isn't empty after sanitization
    return sanitized || null;
}
