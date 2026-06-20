/**
 * Notification utilities respecting user preferences
 */

import { Notice } from 'obsidian';
import { getSettings } from './settings';

export type NotificationType = 'success' | 'error' | 'info';

/**
 * Show notification based on notification level setting
 */
export function notify(message: string, type: NotificationType = 'success'): void {
    const settings = getSettings();
    const level = settings.notificationLevel;

    // Always show errors unless completely silent
    if (type === 'error' && level !== 'none') {
        new Notice(message, 8000);
        return;
    }

    // Show success/info only if level is 'all'
    if (level === 'all') {
        new Notice(message, 4000);
    }
}
