import { App, PluginSettingTab, Setting } from 'obsidian';
import type DndStatblockPlugin from "src/main";
import type { DndStatblockSettingsController } from "src/settings/settings_controller";

export class DndStatblockSettingTab extends PluginSettingTab {

	// ---- fields ----
	plugin: DndStatblockPlugin;
    #controller: DndStatblockSettingsController;

	constructor(
        app: App, 
        plugin: DndStatblockPlugin,
        controller: DndStatblockSettingsController,
    ) {
		super(app, plugin);
		this.plugin = plugin;
        this.#controller = controller;
	}

	// ---- methods ----
	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.#controller.settings.mySetting)
				.onChange(async (value) => {
					this.#controller.settings.mySetting = value;
					await this.#controller.saveSettings();
				}));
	}
}
