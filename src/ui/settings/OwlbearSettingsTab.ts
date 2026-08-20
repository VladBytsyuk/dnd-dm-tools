import { Notice, PluginSettingTab, Setting } from "obsidian";
import { writeTextToClipboard } from "src/data/clipboard";
import type DndStatblockPlugin from "src/main";

export class OwlbearSettingsTab extends PluginSettingTab {
	private unsubscribeRuntime: (() => void) | null = null;
	private refreshQueued = false;

	constructor(private readonly plugin: DndStatblockPlugin) { super(plugin.app, plugin); }

	display(): void {
		this.unsubscribeRuntime?.();
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
			.setDesc("1024–65535. После смены обновите код сопряжения в Owlbear.")
			.addText((text) => text.setValue(pendingPort).setPlaceholder("Случайный").onChange((value) => { pendingPort = value; }))
			.addButton((button) => button.setButtonText("Применить").onClick(async () => {
				await this.plugin.setOwlbearPort(pendingPort.trim() ? Number(pendingPort) : null);
				this.display();
			}))
			.addExtraButton((button) => button.setIcon("refresh-cw").setTooltip("Выбрать случайный порт").onClick(async () => {
				await this.plugin.setOwlbearPort(null);
				this.display();
			}));
		const statusDetails = containerEl.createEl("details");
		statusDetails.createEl("summary", { text: "Статус интеграции" });
		const statusContainer = statusDetails.createDiv();
		const status = this.plugin.getOwlbearServerStatus();
		statusContainer.createEl("p", { text: `Статус: ${status.running ? (status.connected ? "расширение подключено" : "ожидание расширения") : "выключено"}${status.error ? `. Ошибка: ${status.error}` : ""}` });
		const runtime = this.plugin.getOwlbearRuntimeStatus();
		const install = runtime.cloudflared;
		let installText = `cloudflared ${install.version}: ${cloudflaredStateLabel(install.state)}`;
		if (install.state === "downloading") {
			const downloaded = install.downloadedBytes ?? 0;
			const total = install.totalBytes ?? 0;
			const percent = total > 0 ? Math.min(100, Math.round(downloaded * 100 / total)) : 0;
			installText += ` — ${percent}% (${formatBytes(downloaded)} / ${formatBytes(total)})`;
		}
		if (install.error) installText += `. Ошибка: ${install.error}`;
		statusContainer.createEl("p", { text: installText });
		if (settings.enabled && (install.state === "checking" || install.state === "downloading")) {
			statusContainer.createEl("p", { text: "Ожидание cloudflared. Интеграция запустится автоматически после загрузки." });
		}
		if (install.state === "error") {
			new Setting(containerEl).setName("Загрузка cloudflared").addButton((button) => button.setButtonText("Повторить загрузку").onClick(async () => {
				await this.plugin.retryCloudflaredDownload();
				this.display();
			}));
		}
		const tunnel = runtime.tunnel;
		statusContainer.createEl("p", { text: `Туннель: ${tunnelStateLabel(tunnel.state)}${tunnel.publicHost ? `. Публичный host: ${tunnel.publicHost}` : ""}${tunnel.error ? `. Ошибка: ${tunnel.error}` : ""}` });
		if (settings.enabled && tunnel.state === "ready" && !status.connected) {
			statusContainer.createEl("p", { text: "Скопируйте текущий код сопряжения в Owlbear. После перезапуска Obsidian или туннеля код изменится." });
		}
		if (tunnel.diagnostic) {
			const details = statusContainer.createEl("details");
			details.createEl("summary", { text: "Технический лог последней ошибки туннеля" });
			details.createEl("pre", { text: tunnel.diagnostic });
		}
		if (settings.enabled && install.state === "ready") {
			new Setting(containerEl).setName("Quick Tunnel").addButton((button) => button.setButtonText("Перезапустить туннель").onClick(async () => {
				await this.plugin.restartOwlbearTunnel();
				this.display();
			}));
		}
		if (settings.enabled) {
			this.copySetting(containerEl, "Install Link", this.plugin.getOwlbearInstallLink());
		}
		const pairingCode = this.plugin.getOwlbearPairingCode();
		if (settings.enabled && pairingCode) {
			this.copySetting(containerEl, "Код сопряжения", pairingCode);
		}
		this.unsubscribeRuntime = this.plugin.subscribeOwlbearRuntimeStatus(() => {
			if (this.refreshQueued) return;
			this.refreshQueued = true;
			window.setTimeout(() => { this.refreshQueued = false; if (this.containerEl.isConnected) this.display(); }, 100);
		});
	}

	hide(): void {
		this.unsubscribeRuntime?.();
		this.unsubscribeRuntime = null;
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

function cloudflaredStateLabel(state: ReturnType<DndStatblockPlugin["getOwlbearRuntimeStatus"]>["cloudflared"]["state"]): string {
	return ({ checking: "проверка", downloading: "загрузка", ready: "готов", error: "ошибка", unsupported: "не поддерживается" })[state];
}

function tunnelStateLabel(state: ReturnType<DndStatblockPlugin["getOwlbearRuntimeStatus"]>["tunnel"]["state"]): string {
	return ({ stopped: "остановлен", starting: "запуск", ready: "готов", retrying: "повторное подключение", error: "ошибка" })[state];
}

function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 Б";
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
