import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeTextToClipboard } from "src/data/clipboard";
import { createDefaultPluginSettings } from "src/domain/models/settings/PluginSettings";
import { OwlbearSettingsTab } from "src/ui/settings/OwlbearSettingsTab";

const openedModals = vi.hoisted(() => [] as any[]);

vi.mock("src/data/clipboard", () => ({ writeTextToClipboard: vi.fn().mockResolvedValue(undefined) }));
vi.mock("obsidian", async () => {
	const original = await import("../../__mocks__/obsidian");
	class Setting {
		nameEl: HTMLElement;
		descEl: HTMLElement;
		private row: HTMLElement;
		constructor(container: HTMLElement) {
			this.row = container.appendChild(document.createElement("div"));
			this.nameEl = this.row.appendChild(document.createElement("label"));
			this.descEl = this.row.appendChild(document.createElement("p"));
		}
		setClass(value: string) { this.row.classList.add(value); return this; }
		setName(value: string) { this.nameEl.textContent = value; return this; }
		setDesc(value: string) { this.descEl.textContent = value; return this; }
		private addControl(type: "button" | "text" | "checkbox", configure: (control: any) => void) {
			const element = this.row.appendChild(document.createElement(type === "button" ? "button" : "input"));
			if (element instanceof HTMLInputElement) element.type = type;
			const control = {
				setValue: (value: string | boolean) => { if (typeof value === "boolean") (element as HTMLInputElement).checked = value; else (element as HTMLInputElement).value = value; return control; },
				setPlaceholder: (value: string) => { (element as HTMLInputElement).placeholder = value; return control; },
				setButtonText: (value: string) => { element.textContent = value; return control; },
				setDisabled: (value: boolean) => { (element as HTMLButtonElement).disabled = value; return control; },
				setIcon: (_value: string) => control,
				setTooltip: (value: string) => { element.title = value; return control; },
				onClick: (callback: () => void) => { element.addEventListener("click", callback); return control; },
				onChange: (callback: (value: string | boolean) => void) => { element.addEventListener("change", () => callback(type === "checkbox" ? (element as HTMLInputElement).checked : (element as HTMLInputElement).value)); return control; },
			};
			configure(control);
			return this;
		}
		addToggle(configure: (control: any) => void) { return this.addControl("checkbox", configure); }
		addText(configure: (control: any) => void) { return this.addControl("text", configure); }
		addButton(configure: (control: any) => void) { return this.addControl("button", configure); }
		addExtraButton(configure: (control: any) => void) { return this.addControl("button", configure); }
	}
	return {
		...original, Platform: { isDesktopApp: true }, Setting,
		PluginSettingTab: class { containerEl = document.createElement("div"); },
		Modal: class {
			contentEl = document.createElement("div");
			constructor() { openedModals.push(this); }
			open() { document.body.appendChild(this.contentEl); (this as any).onOpen?.(); }
			close() { (this as any).onClose?.(); this.contentEl.remove(); }
		},
	};
});

const domMethods = ["empty", "createEl", "createDiv", "appendText"] as const;
let savedDescriptors: Array<PropertyDescriptor | undefined>;
let tab: OwlbearSettingsTab;

beforeEach(() => {
	openedModals.length = 0;
	vi.stubGlobal("__DND_DM_TOOLS_DEV__", false);
	savedDescriptors = domMethods.map(name => Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
	Object.defineProperties(HTMLElement.prototype, {
		empty: { configurable: true, value() { this.replaceChildren(); } },
		createEl: { configurable: true, value(tag: string, options: { text?: string; href?: string } = {}) {
			const element = document.createElement(tag);
			if (options.text) element.textContent = options.text;
			if (options.href) element.setAttribute("href", options.href);
			this.appendChild(element);
			return element;
		} },
		createDiv: { configurable: true, value() { return this.appendChild(document.createElement("div")); } },
		appendText: { configurable: true, value(text: string) { this.appendChild(document.createTextNode(text)); } },
	});
});

afterEach(() => {
	tab?.hide();
	document.body.replaceChildren();
	domMethods.forEach((name, index) => {
		if (savedDescriptors[index]) Object.defineProperty(HTMLElement.prototype, name, savedDescriptors[index]!);
		else delete (HTMLElement.prototype as any)[name];
	});
	vi.unstubAllGlobals();
});

function renderSettings(enabled = true, failure = false, mcp: { enabled?: boolean; error?: string; unavailableReason?: string; running?: boolean } = {}) {
	const settings = createDefaultPluginSettings();
	settings.owlbearSync = { ...settings.owlbearSync, enabled, port: 43125, developmentExtensionPath: "/dev/bundle" };
	settings.mcp = { enabled: mcp.enabled ?? false, readOnly: false, port: 43126, authToken: "saved-mcp-token" };
	const mcpRuntime = { running: mcp.running ?? !!mcp.enabled, port: 43126, error: mcp.error };
	let mcpListener: (() => void) | undefined;
	const unsubscribeMcp = vi.fn();
	const runtime = {
		cloudflared: { state: failure ? "error" : "ready", version: "2026.5.2", ...(failure ? { error: "Загрузка не удалась" } : {}) },
		tunnel: { state: failure ? "retrying" : "ready", publicHost: "https://test.trycloudflare.com", ...(failure ? { error: "Сбой DNS", diagnostic: "Технический лог" } : {}) },
	};
	const updater = { getStatus: vi.fn(() => ({ state: "current" })), subscribe: vi.fn(() => () => {}), check: vi.fn(), canInstall: vi.fn(() => true) };
	const plugin = {
		app: {}, manifest: { version: "1.2.2" }, getSettings: () => settings,
		getPluginUpdateService: () => updater,
		getMcpRuntimeStatus: () => mcpRuntime,
		getMcpUnavailableReason: () => mcp.unavailableReason ?? null,
		setMcpEnabled: vi.fn(async (value: boolean) => { settings.mcp.enabled = value; }),
		setMcpPort: vi.fn(async (value: number | null) => { settings.mcp.port = value; }),
		setMcpReadOnly: vi.fn(async (value: boolean) => { settings.mcp.readOnly = value; }),
		rotateMcpToken: vi.fn(async () => {}),
		listMcpOperations: vi.fn(async (offset: number, limit: number) => ({ items: [] as any[], total: 0, offset, limit, hasMore: false })),
		getMcpOperation: vi.fn(async (_id: string, _includeChanges: boolean) => null as any),
		undoMcpOperation: vi.fn(async (_id: string) => {}),
		retryMcp: vi.fn(async () => {}),
		subscribeMcpRuntimeStatus: vi.fn((listener: () => void) => { mcpListener = listener; return unsubscribeMcp; }),
		getOwlbearServerStatus: () => ({ running: true, connected: false }),
		getOwlbearRuntimeStatus: () => runtime,
		getOwlbearInstallLink: () => "https://vladbytsyuk.github.io/dnd-dm-tools/owlbear-extension/manifest.json",
		getOwlbearPairingCode: () => "pairing-code",
		subscribeOwlbearRuntimeStatus: vi.fn(() => () => {}),
		updateSettings: vi.fn(async () => {}), restartOwlbearTunnel: vi.fn(async () => {}), retryCloudflaredDownload: vi.fn(async () => {}),
	};
	tab = new OwlbearSettingsTab(plugin as any);
	document.body.appendChild(tab.containerEl);
	tab.display();
	return { plugin, settings, runtime, mcpRuntime, unsubscribeMcp, notifyMcp: () => mcpListener?.() };
}

describe("plugin release settings", () => {
	it("keeps user features and reconnection while hiding development controls and healthy transport details", async () => {
		const { plugin } = renderSettings();
		for (const label of ["Обновления", "Экспортировать ручные сущности", "Импортировать ручные сущности", "Включить интеграцию", "Ссылка для установки расширения", "Код сопряжения"]) {
			expect(screen.getByText(label)).toBeTruthy();
		}
		for (const label of ["Интерфейс", "Новый интерфейс справочников", "Порт", "Путь к dev bundle"]) expect(screen.queryByText(label)).toBeNull();
		expect(document.body.textContent).not.toContain("Публичный host");
		expect(document.body.textContent).not.toContain("cloudflared");
		await fireEvent.click(screen.getByRole("button", { name: "Перезапустить подключение" }));
		await waitFor(() => expect(plugin.restartOwlbearTunnel).toHaveBeenCalledOnce());
	});

	it("shows only the integration toggle when Owlbear is disabled", () => {
		renderSettings(false);
		expect(screen.getByText("Включить интеграцию")).toBeTruthy();
		for (const label of ["Статус интеграции", "Ссылка для установки расширения", "Код сопряжения"]) expect(screen.queryByText(label)).toBeNull();
		expect(screen.queryByRole("button", { name: "Перезапустить подключение" })).toBeNull();
	});

	it("keeps actionable errors, download recovery and collapsed diagnostics in release", async () => {
		const { plugin } = renderSettings(true, true);
		expect(document.body.textContent).toContain("Сбой DNS");
		const details = screen.getByText("Технический лог последней ошибки туннеля").parentElement as HTMLDetailsElement;
		expect(details.open).toBe(false);
		expect(details.textContent).toContain("cloudflared 2026.5.2");
		await fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
		await waitFor(() => expect(plugin.retryCloudflaredDownload).toHaveBeenCalledOnce());
	});

	it("retains developer controls and transport details in development builds", () => {
		vi.stubGlobal("__DND_DM_TOOLS_DEV__", true);
		renderSettings();
		expect(screen.getByText("Порт")).toBeTruthy();
		expect(screen.getByText("Путь к dev bundle")).toBeTruthy();
		expect(document.body.textContent).toContain("cloudflared 2026.5.2");
		expect(document.body.textContent).toContain("Публичный host: https://test.trycloudflare.com");
	});
});

describe("MCP settings", () => {
	it("starts disabled and reveals the bundled server instructions when enabled", async () => {
		const { plugin } = renderSettings(false);
		const toggle = screen.getByText("MCP").parentElement!.querySelector("input")!;
		expect(toggle.checked).toBe(false);
		expect(screen.queryByText("Подключение MCP")).toBeNull();
		await fireEvent.change(toggle, { target: { checked: true } });
		await waitFor(() => expect(plugin.setMcpEnabled).toHaveBeenCalledWith(true));
		await waitFor(() => expect(screen.getByText("Подключение MCP")).toBeTruthy());
		const details = screen.getByText("Подключение MCP").parentElement as HTMLDetailsElement;
		expect(details.open).toBe(false);
		expect(details.textContent).toContain("не требует отдельной установки");
		expect(details.textContent).toContain("Obsidian должен оставаться открытым");
		expect(details.textContent).toContain("elicitation");
		expect(details.textContent).toContain("Удаление через MCP недоступно");
	});

	it("copies the saved endpoint, token and complete HTTP client configuration", async () => {
		renderSettings(false, false, { enabled: true });
		for (const [label, value] of [
			["Адрес MCP", "http://127.0.0.1:43126/mcp"],
			["Токен MCP", "saved-mcp-token"],
			["Конфигурация MCP", JSON.stringify({ mcpServers: { "dnd-dm-tools": { url: "http://127.0.0.1:43126/mcp", headers: { Authorization: "Bearer saved-mcp-token" } } } }, null, 2)],
		]) {
			const button = screen.getByText(label).parentElement!.querySelector("button")!;
			await fireEvent.click(button);
			await waitFor(() => expect(writeTextToClipboard).toHaveBeenCalledWith(value));
		}
	});

	it("disables unsupported runtimes and explains the restriction", () => {
		renderSettings(false, false, { unavailableReason: "MCP доступен только в настольном Obsidian с Node.js 20 или новее." });
		const toggle = screen.getByText("MCP").parentElement!.querySelector("input")!;
		expect(toggle.disabled).toBe(true);
		expect(screen.getByText("MCP доступен только в настольном Obsidian с Node.js 20 или новее.")).toBeTruthy();
	});

	it("shows startup errors with a retry action and retains the saved endpoint", async () => {
		const { plugin } = renderSettings(false, false, { enabled: true, running: false, error: "Порт занят" });
		expect(screen.getByText("MCP: остановлен. Ошибка: Порт занят")).toBeTruthy();
		expect(screen.getByText("http://127.0.0.1:43126/mcp")).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Повторить запуск MCP" }));
		await waitFor(() => expect(plugin.retryMcp).toHaveBeenCalledOnce());
	});

	it("preserves expanded instructions on runtime refresh and unsubscribes when hidden", async () => {
		const { plugin, mcpRuntime, notifyMcp, unsubscribeMcp } = renderSettings(false, false, { enabled: true });
		const details = screen.getByText("Подключение MCP").parentElement as HTMLDetailsElement;
		details.open = true;
		mcpRuntime.running = false;
		notifyMcp();
		await waitFor(() => expect(screen.getByText("MCP: остановлен")).toBeTruthy());
		expect((screen.getByText("Подключение MCP").parentElement as HTMLDetailsElement).open).toBe(true);
		expect(unsubscribeMcp).toHaveBeenCalledOnce();
		tab.hide();
		expect(unsubscribeMcp).toHaveBeenCalledTimes(2);
		const subscriptionCount = plugin.subscribeMcpRuntimeStatus.mock.calls.length;
		notifyMcp();
		await new Promise(resolve => window.setTimeout(resolve, 120));
		expect(plugin.subscribeMcpRuntimeStatus).toHaveBeenCalledTimes(subscriptionCount);
	});

	it("does not resubscribe when enabling finishes after the settings tab was hidden", async () => {
		const { plugin } = renderSettings(false);
		let finishEnabling!: () => void;
		plugin.setMcpEnabled.mockImplementation(() => new Promise<void>(resolve => { finishEnabling = resolve; }));
		const toggle = screen.getByText("MCP").parentElement!.querySelector("input")!;
		await fireEvent.change(toggle, { target: { checked: true } });
		tab.hide();
		finishEnabling();
		await Promise.resolve();
		expect(plugin.subscribeMcpRuntimeStatus).toHaveBeenCalledOnce();
	});

	it("configures the port, free port selection, token and read-only setting", async () => {
		const { plugin } = renderSettings(false, false, { enabled: true });
		const port = screen.getByText("Порт MCP").parentElement!.querySelector("input")!;
		await fireEvent.change(port, { target: { value: "43140" } });
		await fireEvent.click(screen.getByRole("button", { name: "Применить порт MCP" }));
		await waitFor(() => expect(plugin.setMcpPort).toHaveBeenCalledWith(43140));
		await fireEvent.click(screen.getByRole("button", { name: "Выбрать свободный порт MCP" }));
		await waitFor(() => expect(plugin.setMcpPort).toHaveBeenCalledWith(null));
		await fireEvent.click(screen.getByRole("button", { name: "Обновить токен MCP" }));
		await waitFor(() => expect(plugin.rotateMcpToken).toHaveBeenCalledOnce());
		const readOnly = screen.getByText("MCP: только чтение").parentElement!.querySelector("input")!;
		await fireEvent.change(readOnly, { target: { checked: true } });
		await waitFor(() => expect(plugin.setMcpReadOnly).toHaveBeenCalledWith(true));
	});
});

describe("MCP history", () => {
	const operation = {
		operationId: "op1", requestHash: "hash", status: "succeeded", createdAt: 1_000, updatedAt: 1_001,
		summary: [{ kind: "track", url: "/track/music", name: "Музыка", action: "create" }],
	};

	it("opens the persistent history while MCP is disabled", async () => {
		const { plugin } = renderSettings(false);
		await fireEvent.click(screen.getByRole("button", { name: "Открыть журнал MCP" }));
		await waitFor(() => expect(plugin.listMcpOperations).toHaveBeenCalledWith(0, 20));
		expect(await screen.findByText("Операций MCP пока нет.")).toBeTruthy();
	});

	it("paginates twenty operations at a time and shows compact names and statuses", async () => {
		const { plugin } = renderSettings(false);
		plugin.listMcpOperations.mockResolvedValueOnce({ items: [operation], total: 21, offset: 0, limit: 20, hasMore: true })
			.mockResolvedValueOnce({ items: [{ ...operation, operationId: "op21", status: "failed", summary: [{ ...operation.summary[0], name: "Другой трек" }] }], total: 21, offset: 20, limit: 20, hasMore: false });
		await fireEvent.click(screen.getByRole("button", { name: "Открыть журнал MCP" }));
		await screen.findByText(/Выполнено.*Музыка/);
		expect(plugin.getMcpOperation).not.toHaveBeenCalled();
		await fireEvent.click(screen.getByRole("button", { name: "Следующие" }));
		await screen.findByText(/Ошибка.*Другой трек/);
		expect(plugin.listMcpOperations).toHaveBeenLastCalledWith(20, 20);
		expect((screen.getByRole("button", { name: "Следующие" }) as HTMLButtonElement).disabled).toBe(true);
	});

	it("loads before and after lazily and requires a separate compact undo confirmation", async () => {
		const { plugin } = renderSettings(false);
		plugin.listMcpOperations.mockResolvedValue({ items: [operation], total: 1, offset: 0, limit: 20, hasMore: false });
		plugin.getMcpOperation.mockResolvedValue({ ...operation, changes: [{ kind: "track", url: "/track/music", before: null, after: { name: "Музыка", description: "private payload" } }] });
		await fireEvent.click(screen.getByRole("button", { name: "Открыть журнал MCP" }));
		const row = (await screen.findByText(/Выполнено.*Музыка/)).parentElement as HTMLDetailsElement;
		row.open = true;
		await fireEvent(row, new Event("toggle"));
		await screen.findByText(/private payload/);
		expect(plugin.getMcpOperation).toHaveBeenCalledWith("op1", true);
		await fireEvent.click(screen.getByRole("button", { name: "Отменить операцию" }));
		expect(plugin.undoMcpOperation).not.toHaveBeenCalled();
		expect(openedModals[1].contentEl.textContent).toContain("Музыка");
		expect(openedModals[1].contentEl.textContent).toContain("Удаление созданной сущности");
		expect(openedModals[1].contentEl.textContent).not.toContain("private payload");
		await fireEvent.click(screen.getByRole("button", { name: "Подтвердить отмену" }));
		await waitFor(() => expect(plugin.undoMcpOperation).toHaveBeenCalledWith("op1"));
	});

	it("explains that undoing an update restores the previous version", async () => {
		const { plugin } = renderSettings(false);
		plugin.listMcpOperations.mockResolvedValue({ items: [{ ...operation, summary: [{ ...operation.summary[0], action: "update" }] }], total: 1, offset: 0, limit: 20, hasMore: false });
		await fireEvent.click(screen.getByRole("button", { name: "Открыть журнал MCP" }));
		const row = (await screen.findByText(/Выполнено.*Музыка/)).parentElement as HTMLDetailsElement;
		row.open = true;
		await fireEvent.click(screen.getByRole("button", { name: "Отменить операцию" }));
		expect(openedModals[1].contentEl.textContent).toContain("Восстановление предыдущей версии");
		expect(openedModals[1].contentEl.textContent).not.toContain("Удаление созданной сущности");
		await fireEvent.click(screen.getByRole("button", { name: "Назад" }));
		expect(plugin.undoMcpOperation).not.toHaveBeenCalled();
	});

	it("does not offer undo for rejected or previously undone operations", async () => {
		const { plugin } = renderSettings(false);
		plugin.listMcpOperations.mockResolvedValue({ items: [{ ...operation, undoneBy: "undo1" }, { ...operation, operationId: "op2", status: "rejected" }], total: 2, offset: 0, limit: 20, hasMore: false });
		await fireEvent.click(screen.getByRole("button", { name: "Открыть журнал MCP" }));
		await screen.findByText(/Выполнено.*Отменено/);
		expect(screen.queryByText("Отменить операцию")).toBeNull();
	});
});
