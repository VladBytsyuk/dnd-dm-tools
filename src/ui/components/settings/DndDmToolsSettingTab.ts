import { PluginSettingTab, Setting } from "obsidian";
import type DndStatblockPlugin from "src/main";
import { PANEL_KEYS, type PanelKey, type PluginMode } from "src/domain/settings/PluginSettings";

const PANEL_TITLES: Record<PanelKey, string> = {
	"bestiary": "Бестиарий",
	"spellbook": "Книга заклинаний",
	"dm-screen": "Ширма",
	"arsenal": "Арсенал",
	"armory": "Броня",
	"equipment": "Экипировка",
	"artifactory": "Магические предметы",
	"backgrounds": "Предыстории",
	"feats": "Черты",
	"races": "Расы",
	"classes": "Классы",
	"character-sheets": "Листы персонажей",
	"initiative-tracker": "Трекер инициативы",
};

export class DndDmToolsSettingTab extends PluginSettingTab {
	constructor(private plugin: DndStatblockPlugin) {
		super(plugin.app, plugin);
	}

	display(): void {
		this.containerEl.empty();
		this.containerEl.createEl("h2", { text: "DnD DM Tools" });

		new Setting(this.containerEl)
			.setName("Режим панелей")
			.setDesc("Раздельные панели или единая панель с вкладками")
			.addDropdown((dropdown) => dropdown
				.addOption("separate", "Раздельный")
				.addOption("omni", "Омни")
				.setValue(this.plugin.settings.mode)
				.onChange(async (value) => {
					await this.plugin.setMode(value as PluginMode);
					this.display();
				}));

		if (this.plugin.settings.mode === "omni") {
			this.containerEl.createEl("p", {
				text: "Омни-панель объединяет поиск, вкладки и две вертикальные области.",
			});
			return;
		}

		this.containerEl.createEl("h3", { text: "Панели" });
		for (const key of PANEL_KEYS) {
			new Setting(this.containerEl)
				.setName(PANEL_TITLES[key])
				.addToggle((toggle) => toggle
					.setValue(this.plugin.settings.separatePanels[key])
					.onChange(async (enabled) => {
						await this.plugin.setSeparatePanelEnabled(key, enabled);
					}));
		}
	}
}

