import { App, PluginSettingTab, Setting } from 'obsidian';
import type DndStatblockPlugin from "src/main";
import { TEXTS } from 'src/res/texts_ru';
import { DndStatblockSettingsController } from './settings_controller';
import { LayoutStyle } from './layout_style';

export function registerSettingsTab(
	plugin: DndStatblockPlugin,
	settingsController: DndStatblockSettingsController,
) {
	plugin.addSettingTab(new DndStatblockSettingTab(plugin.app, plugin, settingsController));
}

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
			.setName(TEXTS.settingsLayout)
			.setDesc(TEXTS.settingsLayoutDescription)
			.addDropdown(cb => cb
				.addOption(LayoutStyle.Dnd5e, TEXTS.settingsLayout5e)
				.addOption(LayoutStyle.TtgClub, TEXTS.settingsLayoutTtg)
				.setValue(this.#controller.settings.layoutStyle)
				.onChange(async (value) => {
					this.#controller.settings.layoutStyle = value as LayoutStyle;
					await this.#controller.saveSettings();
				})
			)
	}
}
