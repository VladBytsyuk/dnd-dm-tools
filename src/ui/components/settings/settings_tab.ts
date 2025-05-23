import { App, PluginSettingTab, Setting } from 'obsidian';
import type DndStatblockPlugin from "src/main";
import { TEXTS } from 'src/res/texts_ru';
import { DndSettingsController } from './settings_controller';
import { LayoutStyle } from './layout_style';

export function registerSettingsTab(
	plugin: DndStatblockPlugin,
	settingsController: DndSettingsController,
) {
	plugin.addSettingTab(new DndStatblockSettingTab(plugin.app, plugin, settingsController));
}

export class DndStatblockSettingTab extends PluginSettingTab {

	// ---- fields ----
	plugin: DndStatblockPlugin;
    #controller: DndSettingsController;

	constructor(
        app: App, 
        plugin: DndStatblockPlugin,
        controller: DndSettingsController,
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
					const newLayoutStyle = value as LayoutStyle;
					this.#controller.settings.layoutStyle = newLayoutStyle;
					this.#controller.settings.onLayoutStyleChanged();
					await this.#controller.saveSettings();
				})
			)
	}
}
