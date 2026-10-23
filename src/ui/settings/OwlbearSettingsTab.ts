import { Notice, Platform, PluginSettingTab, Setting } from "obsidian";
import { writeTextToClipboard } from "src/data/clipboard";
import type { PluginUpdateStatus } from "src/data/services/PluginUpdateService";
import type DndStatblockPlugin from "src/main";
import { McpHistoryModal } from "./McpHistoryModal";

export class OwlbearSettingsTab extends PluginSettingTab {
	private unsubscribeRuntime: (() => void) | null = null;
	private unsubscribeUpdate: (() => void) | null = null;
	private unsubscribeMcp: (() => void) | null = null;
	private mcpDetails: HTMLDetailsElement | null = null;
	private visible = false;
	private refreshQueued = false;
	private updateCheckStarted = false;

	constructor(private readonly plugin: DndStatblockPlugin) { super(plugin.app, plugin); }

	display(): void {
		this.visible = true;
		const mcpDetailsOpen = this.mcpDetails?.open ?? false;
		this.unsubscribeRuntime?.();
		this.unsubscribeUpdate?.();
		this.unsubscribeMcp?.();
		const { containerEl } = this;
		containerEl.empty();
		this.renderPluginVersion(containerEl);
		containerEl.createEl("h2", { text: "Ручные сущности" });
		new Setting(containerEl)
			.setName("Экспортировать ручные сущности")
			.setDesc("Скачать JSON с созданными и отредактированными вручную сущностями.")
			.addButton((button) => button.setButtonText("Экспортировать").onClick(async () => {
				try {
					const json = await this.plugin.exportManualEntities();
					downloadJson(json, `dnd-dm-tools-manual-entities-${new Date().toISOString().slice(0, 10)}.json`);
					new Notice("Архив ручных сущностей скачан.");
				} catch (error) {
					new Notice(`Не удалось экспортировать сущности: ${error instanceof Error ? error.message : String(error)}`);
				}
			}));
		new Setting(containerEl)
			.setName("Импортировать ручные сущности")
			.setDesc("Загрузить JSON-архив. Ручные совпадения будут обновлены, внешние — пропущены.")
			.addButton((button) => button.setButtonText("Импортировать").onClick(() => chooseArchive(async (json) => {
				try {
					const report = await this.plugin.importManualEntities(json);
					new Notice(`Импорт: создано ${report.created}, обновлено ${report.updated}, пропущено ${report.skipped}, ошибок ${report.failed}.`);
				} catch (error) {
					new Notice(`Не удалось импортировать сущности: ${error instanceof Error ? error.message : String(error)}`);
				}
			})));
		containerEl.createEl("hr");
		this.renderMcp(containerEl, mcpDetailsOpen);
		containerEl.createEl("hr");
		containerEl.createEl("h2", { text: "Интеграция с Owlbear" });
		const settings = this.plugin.getSettings().owlbearSync;
		new Setting(containerEl)
			.setName("Включить интеграцию")
			.setDesc(Platform.isDesktopApp ? "Синхронизировать столкновения и отправлять изображения в Owlbear Rodeo." : "Интеграция доступна только в настольном Obsidian.")
			.addToggle((toggle) => toggle.setValue(settings.enabled).onChange(async (enabled) => {
				await this.plugin.setOwlbearIntegrationEnabled(enabled);
				this.display();
			}));
		if (__DND_DM_TOOLS_DEV__) {
			let developmentPath = settings.developmentExtensionPath ?? "";
			new Setting(containerEl)
				.setName("Путь к dev bundle")
				.setDesc("Абсолютный путь к owlbear-extension/dist для локальной dev-сборки.")
				.addText((text) => text.setValue(developmentPath).setPlaceholder("/путь/к/owlbear-extension/dist").onChange((value) => { developmentPath = value; }))
				.addButton((button) => button.setButtonText("Сохранить").onClick(async () => {
					await this.plugin.setOwlbearDevelopmentExtensionPath(developmentPath);
					this.display();
				}));
			let pendingPort = settings.port?.toString() ?? "";
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
		}
		if (settings.enabled || __DND_DM_TOOLS_DEV__) {
			const statusDetails = containerEl.createEl("details");
			statusDetails.createEl("summary", { text: "Статус интеграции" });
			const statusContainer = statusDetails.createDiv();
			const status = this.plugin.getOwlbearServerStatus();
			statusContainer.createEl("p", { text: `Статус: ${status.running ? (status.connected ? "расширение подключено" : "ожидание расширения") : "выключено"}${status.error ? `. Ошибка: ${status.error}` : ""}` });
			const runtime = this.plugin.getOwlbearRuntimeStatus();
			const install = runtime.cloudflared;
			let installText = `${__DND_DM_TOOLS_DEV__ ? `cloudflared ${install.version}` : "Компонент подключения"}: ${cloudflaredStateLabel(install.state)}`;
			if (install.state === "downloading") {
				const downloaded = install.downloadedBytes ?? 0;
				const total = install.totalBytes ?? 0;
				const percent = total > 0 ? Math.min(100, Math.round(downloaded * 100 / total)) : 0;
				installText += ` — ${percent}% (${formatBytes(downloaded)} / ${formatBytes(total)})`;
			}
			if (install.error) installText += `. Ошибка: ${install.error}`;
			statusContainer.createEl("p", { text: installText });
			if (settings.enabled && (install.state === "checking" || install.state === "downloading")) {
				statusContainer.createEl("p", { text: "Подготовка подключения. Интеграция запустится автоматически после загрузки." });
			}
			if (settings.enabled && install.state === "error") {
				new Setting(containerEl).setName("Компонент подключения").addButton((button) => button.setButtonText("Повторить загрузку").onClick(async () => {
					await this.plugin.retryCloudflaredDownload();
					this.display();
				}));
			}
			const tunnel = runtime.tunnel;
			statusContainer.createEl("p", { text: `Туннель: ${tunnelStateLabel(tunnel.state)}${__DND_DM_TOOLS_DEV__ && tunnel.publicHost ? `. Публичный host: ${tunnel.publicHost}` : ""}${tunnel.error ? `. Ошибка: ${tunnel.error}` : ""}` });
			if (settings.enabled && tunnel.state === "ready" && !status.connected) {
				statusContainer.createEl("p", { text: "Скопируйте текущий код сопряжения в Owlbear. После перезапуска Obsidian или туннеля код изменится." });
			}
			if (tunnel.diagnostic) {
				const details = statusContainer.createEl("details");
				details.createEl("summary", { text: "Технический лог последней ошибки туннеля" });
				details.createEl("pre", { text: `cloudflared ${install.version}\n${tunnel.diagnostic}` });
			}
			if (settings.enabled && install.state === "ready") {
				new Setting(containerEl).setName("Подключение Owlbear")
					.setDesc("После перезапуска скопируйте новый код сопряжения в расширение.")
					.addButton((button) => button.setButtonText("Перезапустить подключение").onClick(async () => {
					await this.plugin.restartOwlbearTunnel();
					this.display();
				}));
			}
		}
		if (settings.enabled) {
			this.copySetting(containerEl, "Ссылка для установки расширения", this.plugin.getOwlbearInstallLink());
		}
		const pairingCode = this.plugin.getOwlbearPairingCode();
		if (settings.enabled && pairingCode) {
			this.copySetting(containerEl, "Код сопряжения", pairingCode);
		}
		this.unsubscribeRuntime = this.plugin.subscribeOwlbearRuntimeStatus(() => this.queueRefresh());
		this.unsubscribeUpdate = this.plugin.getPluginUpdateService().subscribe(() => this.queueRefresh());
		this.unsubscribeMcp = this.plugin.subscribeMcpRuntimeStatus(() => this.queueRefresh());
		if (!this.updateCheckStarted) {
			this.updateCheckStarted = true;
			void this.plugin.getPluginUpdateService().check();
		}
	}

	hide(): void {
		this.visible = false;
		this.unsubscribeRuntime?.();
		this.unsubscribeRuntime = null;
		this.unsubscribeUpdate?.();
		this.unsubscribeUpdate = null;
		this.unsubscribeMcp?.();
		this.unsubscribeMcp = null;
		this.updateCheckStarted = false;
	}

	private renderMcp(containerEl: HTMLElement, detailsOpen: boolean): void {
		const settings = this.plugin.getSettings().mcp;
		const unavailableReason = this.plugin.getMcpUnavailableReason();
		new Setting(containerEl)
			.setName("MCP")
			.setDesc(unavailableReason ?? "Доступ агентов к справочникам и медиатеке через локальный MCP-сервер.")
			.addToggle((toggle) => toggle.setValue(settings.enabled).setDisabled(!!unavailableReason).onChange(async (enabled) => {
				try {
					await this.plugin.setMcpEnabled(enabled);
				} catch (error) {
					new Notice(`Не удалось изменить настройки MCP: ${error instanceof Error ? error.message : String(error)}`);
				}
				if (this.visible) this.display();
			}));
		new Setting(containerEl).setName("Журнал MCP")
			.setDesc("История изменений и отмена выполненных операций доступны и при выключенном MCP.")
			.addButton((button) => button.setButtonText("Открыть журнал MCP").onClick(() => new McpHistoryModal(this.plugin).open()));
		this.mcpDetails = null;
		if (!settings.enabled) return;
		let pendingPort = settings.port?.toString() ?? "";
		new Setting(containerEl).setClass("dnd-mcp-port-setting").setName("Порт MCP").setDesc("Целое число от 1024 до 65535. После смены обновите адрес в MCP-клиенте.")
			.addText((text) => text.setValue(pendingPort).setPlaceholder("Свободный порт").onChange((value) => { pendingPort = value; }))
			.addButton((button) => button.setButtonText("Применить порт MCP").setDisabled(!!unavailableReason).onClick(() => this.performMcpAction(() => this.plugin.setMcpPort(pendingPort.trim() ? Number(pendingPort) : null))));
		new Setting(containerEl).setClass("dnd-mcp-port-setting").setName("Автоматический порт MCP")
			.setDesc("Выбрать свободный порт и сохранить новый адрес подключения.")
			.addButton((button) => button.setButtonText("Выбрать свободный порт MCP").setDisabled(!!unavailableReason).onClick(() => this.performMcpAction(() => this.plugin.setMcpPort(null))));
		new Setting(containerEl).setName("MCP: только чтение")
			.setDesc("Разрешить агентам только поиск и чтение. Изменение режима прекращает текущие подключения и ожидающие подтверждения.")
			.addToggle((toggle) => toggle.setValue(settings.readOnly).setDisabled(!!unavailableReason).onChange((readOnly) => this.performMcpAction(() => this.plugin.setMcpReadOnly(readOnly))));
		new Setting(containerEl).setName("Токен доступа MCP")
			.setDesc("Новый токен сразу закрывает старые подключения. После смены обновите токен в MCP-клиенте.")
			.addButton((button) => button.setButtonText("Обновить токен MCP").setDisabled(!!unavailableReason).onClick(() => this.performMcpAction(() => this.plugin.rotateMcpToken())));
		const status = this.plugin.getMcpRuntimeStatus();
		containerEl.createEl("p", { text: `MCP: ${status.running ? "запущен" : "остановлен"}${status.error ? `. Ошибка: ${status.error}` : ""}` });
		if (status.error && !unavailableReason) {
			new Setting(containerEl).setName("Запуск MCP").addButton((button) => button.setButtonText("Повторить запуск MCP").onClick(async () => {
				try {
					await this.plugin.retryMcp();
				} catch (error) {
					new Notice(`Не удалось запустить MCP: ${error instanceof Error ? error.message : String(error)}`);
				}
				if (this.visible) this.display();
			}));
		}
		const details = containerEl.createEl("details");
		this.mcpDetails = details;
		details.open = detailsOpen;
		details.createEl("summary", { text: "Подключение MCP" });
		details.createEl("p", { text: "Сервер входит в состав плагина и не требует отдельной установки. Добавьте конфигурацию в ваш MCP-клиент. Во время работы Obsidian должен оставаться открытым. Адрес и токен сохраняются после перезапуска." });
		details.createEl("p", { text: "Для создания и изменения данных клиент должен поддерживать elicitation: каждая операция требует вашего подтверждения. Удаление через MCP недоступно." });
		const port = status.port ?? settings.port;
		if (port !== null && settings.authToken) {
			const url = `http://127.0.0.1:${port}/mcp`;
			this.copySetting(details, "Адрес MCP", url);
			this.copySetting(details, "Токен MCP", settings.authToken);
			const configuration = JSON.stringify({ mcpServers: { "dnd-dm-tools": { url, headers: { Authorization: `Bearer ${settings.authToken}` } } } }, null, 2);
			details.createEl("pre", { text: configuration });
			this.copySetting(details, "Конфигурация MCP", configuration, "Скопировать конфигурацию для MCP-клиента.");
		} else {
			details.createEl("p", { text: "Адрес и токен появятся после первого успешного запуска MCP." });
		}
	}

	private async performMcpAction(action: () => Promise<void>): Promise<void> {
		try { await action(); }
		catch (error) { new Notice(`Не удалось изменить настройки MCP: ${error instanceof Error ? error.message : String(error)}`); }
		if (this.visible) this.display();
	}

	private renderPluginVersion(containerEl: HTMLElement): void {
		containerEl.createEl("h2", { text: "Обновления" });
		const updater = this.plugin.getPluginUpdateService();
		const status = updater.getStatus();
		const setting = new Setting(containerEl)
			.setName(`Версия плагина: ${this.plugin.manifest.version}`)
			.setDesc(updateStatusText(status));
		const release = status.state === "available" || status.state === "error" ? status.release : undefined;
		if (release) {
			if (!release.archive) {
				appendReleaseLink(setting.descEl, release.pageUrl, "Скачать релиз вручную");
			} else if (!Platform.isDesktopApp || !updater.canInstall()) {
				setting.descEl.appendText(" Установка доступна в настольном Obsidian.");
			} else {
				setting.addButton((button) => button.setButtonText(status.state === "error" ? "Повторить" : "Обновить")
					.onClick(() => { void updater.install(); }));
				if (status.state === "error") appendReleaseLink(setting.descEl, release.pageUrl, "Открыть релиз");
			}
		} else if (status.state === "error") {
			setting.addButton((button) => button.setButtonText("Повторить проверку")
				.onClick(() => { void updater.check(); }));
		} else if (status.state === "downloading" || status.state === "downloadingTool" || status.state === "installing") {
			setting.addButton((button) => button.setButtonText("Обновление...").setDisabled(true));
		}
	}

	private queueRefresh(): void {
		if (this.refreshQueued) return;
		this.refreshQueued = true;
		window.setTimeout(() => { this.refreshQueued = false; if (this.visible && this.containerEl.isConnected) this.display(); }, 100);
	}

	private copySetting(containerEl: HTMLElement, name: string, value: string, description = value): void {
		new Setting(containerEl).setName(name).setDesc(description).addButton((button) => button.setButtonText("Копировать").onClick(async () => {
			try {
				await writeTextToClipboard(value);
				new Notice(`${name} скопирован.`);
			} catch {
				new Notice(`Не удалось скопировать ${name}.`);
			}
		}));
	}
}

function updateStatusText(status: PluginUpdateStatus): string {
	switch (status.state) {
		case "idle":
		case "checking": return "Проверка обновлений...";
		case "current": return "Последняя актуальная версия";
		case "available": return `Есть версия новее ${status.release.version}.`;
		case "downloading": {
			const percent = status.totalBytes > 0 ? Math.min(100, Math.round(status.downloadedBytes * 100 / status.totalBytes)) : 0;
			return `Загрузка обновления: ${percent}% (${formatBytes(status.downloadedBytes)} / ${formatBytes(status.totalBytes)}).`;
		}
		case "downloadingTool": return "Подготовка обновления...";
		case "installing": return "Установка обновления...";
		case "complete": return `Версия ${status.version} установлена. Перезапустите Obsidian, чтобы применить обновление.`;
		case "error": return `${status.release ? "Не удалось обновить плагин" : "Не удалось проверить обновления"}: ${status.message}`;
	}
}

function appendReleaseLink(container: HTMLElement, url: string, label: string): void {
	container.appendText(" ");
	const link = container.createEl("a", { text: label, href: url });
	link.target = "_blank";
	link.rel = "noopener noreferrer";
}

function downloadJson(json: string, filename: string): void {
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function chooseArchive(onLoad: (json: string) => Promise<void>): void {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".json,application/json";
	input.onchange = () => {
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => { if (typeof reader.result === "string") void onLoad(reader.result); };
		reader.onerror = () => new Notice("Не удалось прочитать выбранный файл.");
		reader.readAsText(file);
	};
	input.click();
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
