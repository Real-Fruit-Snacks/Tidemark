/**
 * Settings management for Obsidian plugin
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import type TidemarkPlugin from '../main';
import { PluginSettings, DEFAULT_SETTINGS } from '../types';

let currentSettings: PluginSettings = { ...DEFAULT_SETTINGS };
let pluginInstance: TidemarkPlugin | null = null;
let settingsChangeCallback: (() => void) | null = null;

/**
 * Initialize settings from plugin's saved data
 */
export function initSettings(plugin: TidemarkPlugin, loadedData: any): void {
    pluginInstance = plugin;
    currentSettings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    // Ensure nested highlightColors is merged properly
    if (loadedData?.highlightColors) {
        currentSettings.highlightColors = Object.assign(
            {},
            DEFAULT_SETTINGS.highlightColors,
            loadedData.highlightColors
        );
    }
}

/**
 * Get current plugin settings
 */
export function getSettings(): PluginSettings {
    return currentSettings;
}

/**
 * Save settings updates
 */
type SettingsUpdate = Omit<Partial<PluginSettings>, 'highlightColors'> & {
    highlightColors?: Partial<PluginSettings['highlightColors']>;
};

export async function saveSettings(updates: SettingsUpdate): Promise<void> {
    // Deep merge nested objects (highlightColors) to avoid losing sibling keys
    if (updates.highlightColors) {
        const merged = Object.assign(
            {},
            currentSettings.highlightColors,
            updates.highlightColors
        );
        currentSettings.highlightColors = merged;
        delete updates.highlightColors;
    }
    Object.assign(currentSettings, updates);
    if (pluginInstance) {
        await pluginInstance.saveData(currentSettings);
    }
    if (settingsChangeCallback) {
        settingsChangeCallback();
    }
}

/**
 * Register a callback for when settings change
 */
export function onSettingsChange(callback: () => void): void {
    settingsChangeCallback = callback;
}

/**
 * Settings tab for Obsidian
 */
export class TidemarkSettingTab extends PluginSettingTab {
    plugin: TidemarkPlugin;

    constructor(app: App, plugin: TidemarkPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // --- Delimiters ---
        containerEl.createEl('h3', { text: 'Delimiters' });

        new Setting(containerEl)
            .setName('Open delimiter')
            .setDesc('Characters that mark the start of a variable')
            .addText(text => text
                .setPlaceholder('{{')
                .setValue(currentSettings.openDelimiter)
                .onChange(async (value) => {
                    await saveSettings({ openDelimiter: value || '{{' });
                }));

        new Setting(containerEl)
            .setName('Close delimiter')
            .setDesc('Characters that mark the end of a variable')
            .addText(text => text
                .setPlaceholder('}}')
                .setValue(currentSettings.closeDelimiter)
                .onChange(async (value) => {
                    await saveSettings({ closeDelimiter: value || '}}' });
                }));

        new Setting(containerEl)
            .setName('Default separator')
            .setDesc('Separator between variable name and default value (e.g., : for {{var:default}})')
            .addText(text => text
                .setPlaceholder(':')
                .setValue(currentSettings.defaultSeparator)
                .onChange(async (value) => {
                    await saveSettings({ defaultSeparator: value || ':' });
                }));

        // --- Behavior ---
        containerEl.createEl('h3', { text: 'Behavior' });

        new Setting(containerEl)
            .setName('Missing value text')
            .setDesc('Text to use when a variable is not found in frontmatter')
            .addText(text => text
                .setPlaceholder('[MISSING]')
                .setValue(currentSettings.missingValueText)
                .onChange(async (value) => {
                    await saveSettings({ missingValueText: value || '[MISSING]' });
                }));

        new Setting(containerEl)
            .setName('Support nested properties')
            .setDesc('Allow dot notation for nested properties (e.g., {{server.ip}})')
            .addToggle(toggle => toggle
                .setValue(currentSettings.supportNestedProperties)
                .onChange(async (value) => {
                    await saveSettings({ supportNestedProperties: value });
                }));

        new Setting(containerEl)
            .setName('Case insensitive')
            .setDesc('Match variables regardless of case (e.g., {{ipaddress}} matches IPAddress)')
            .addToggle(toggle => toggle
                .setValue(currentSettings.caseInsensitive)
                .onChange(async (value) => {
                    await saveSettings({ caseInsensitive: value });
                }));

        new Setting(containerEl)
            .setName('Array join separator')
            .setDesc('Characters used to join array values')
            .addText(text => text
                .setPlaceholder(', ')
                .setValue(currentSettings.arrayJoinSeparator)
                .onChange(async (value) => {
                    await saveSettings({ arrayJoinSeparator: value });
                }));

        new Setting(containerEl)
            .setName('Preserve original on missing')
            .setDesc('Keep {{variable}} instead of replacing with missing text when not found')
            .addToggle(toggle => toggle
                .setValue(currentSettings.preserveOriginalOnMissing)
                .onChange(async (value) => {
                    await saveSettings({ preserveOriginalOnMissing: value });
                }));

        new Setting(containerEl)
            .setName('Notification level')
            .setDesc('Control when notifications are shown')
            .addDropdown(dropdown => dropdown
                .addOption('all', 'Show all notifications')
                .addOption('errors', 'Only show errors')
                .addOption('none', 'Silent (no notifications)')
                .setValue(currentSettings.notificationLevel)
                .onChange(async (value) => {
                    await saveSettings({ notificationLevel: value as 'all' | 'errors' | 'none' });
                }));

        // --- Visual ---
        containerEl.createEl('h3', { text: 'Visual' });

        new Setting(containerEl)
            .setName('Highlight variables')
            .setDesc('Color-code variables in the editor: green (exists), orange (has default), red (missing)')
            .addToggle(toggle => toggle
                .setValue(currentSettings.highlightVariables)
                .onChange(async (value) => {
                    await saveSettings({ highlightVariables: value });
                }));

        new Setting(containerEl)
            .setName('Color: exists')
            .setDesc('Color for variables with values in frontmatter (empty = default green). Use hex like #28a745')
            .addText(text => text
                .setPlaceholder('#a6e3a1')
                .setValue(currentSettings.highlightColors.exists)
                .onChange(async (value) => {
                    await saveSettings({
                        highlightColors: { exists: value }
                    });
                }));

        new Setting(containerEl)
            .setName('Color: missing')
            .setDesc('Color for variables without values or defaults (empty = default red). Use hex like #dc3545')
            .addText(text => text
                .setPlaceholder('#f38ba8')
                .setValue(currentSettings.highlightColors.missing)
                .onChange(async (value) => {
                    await saveSettings({
                        highlightColors: { missing: value }
                    });
                }));

        new Setting(containerEl)
            .setName('Color: has default')
            .setDesc('Color for variables with default values (empty = default orange). Use hex like #e6a700')
            .addText(text => text
                .setPlaceholder('#f9e2af')
                .setValue(currentSettings.highlightColors.hasDefault)
                .onChange(async (value) => {
                    await saveSettings({
                        highlightColors: { hasDefault: value }
                    });
                }));
    }
}
