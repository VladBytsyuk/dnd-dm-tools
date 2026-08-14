import { Notice, PluginSettingTab, Setting } from "obsidian";
import { writeTextToClipboard } from "src/data/clipboard";
import type DndStatblockPlugin from "src/main";

export class OwlbearSettingsTab extends PluginSettingTab {
	constructor(private readonly plugin: DndStatblockPlugin) { super(plugin.app, plugin); }

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Интеграция с Owlbear" });
		const settings = this.plugin.getSettings().owlbearSync;
		let pendingPort = settings.port?.toString() ?? "";
		new Setting(containerEl)
			.setName("Включить интеграцию")
			.setDesc("Запускает локальный сервер для Owlbear Rodeo.")
			.addToggle((toggle) => toggle.setValue(settings.enabled).onChange(async (enabled) => {
				await this.plugin.setOwlbearIntegrationEnabled(enabled);
				this.display();
			}));
		if (__DND_DM_TOOLS_DEV__) {
			let developmentPath = settings.developmentExtensionPath ?? "";
			new Setting(containerEl)
				.setName("Путь к dev bundle")
				.setDesc("Необязательно. Абсолютный путь к owlbear-extension/dist для разработки без release-сборки.")
				.addText((text) => text.setValue(developmentPath).setPlaceholder("/путь/к/owlbear-extension/dist").onChange((value) => { developmentPath = value; }))
				.addButton((button) => button.setButtonText("Сохранить").onClick(async () => {
					await this.plugin.setOwlbearDevelopmentExtensionPath(developmentPath);
					this.display();
				}));
		}
		new Setting(containerEl)
			.setName("Порт")
			.setDesc("1024–65535. После смены обновите Install Link в Owlbear.")
			.addText((text) => text.setValue(pendingPort).setPlaceholder("Случайный").onChange((value) => { pendingPort = value; }))
			.addButton((button) => button.setButtonText("Применить").onClick(async () => {
				await this.plugin.setOwlbearPort(pendingPort.trim() ? Number(pendingPort) : null);
				this.display();
			}))
			.addExtraButton((button) => button.setIcon("refresh-cw").setTooltip("Выбрать случайный порт").onClick(async () => {
				await this.plugin.setOwlbearPort(null);
				this.display();
			}));
		const status = this.plugin.getOwlbearServerStatus();
		containerEl.createEl("p", { text: `Статус: ${status.running ? (status.connected ? "расширение подключено" : "ожидание расширения") : "выключено"}${status.error ? `. Ошибка: ${status.error}` : ""}` });
		containerEl.createEl("p", {
			text: "Новая сессия Obsidian намеренно сбрасывает прежнее столкновение: после подключения Owlbear удалит созданные интеграцией токены вместе с их позициями. Отправьте нужное столкновение из трекера заново.",
		});
		if (settings.enabled && settings.port && settings.authToken) {
			this.copySetting(containerEl, "Install Link", this.plugin.getOwlbearInstallLink());
			this.copySetting(containerEl, "Код сопряжения", this.plugin.getOwlbearPairingCode());
		}
	}

	private copySetting(containerEl: HTMLElement, name: string, value: string): void {
		new Setting(containerEl).setName(name).setDesc(value).addButton((button) => button.setButtonText("Копировать").onClick(async () => {
			try {
				await writeTextToClipboard(value);
				new Notice(`${name} скопирован.`);
			} catch {
				new Notice(`Не удалось скопировать ${name}.`);
			}
		}));
	}
}
