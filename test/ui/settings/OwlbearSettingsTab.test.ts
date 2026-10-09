import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultPluginSettings } from "src/domain/models/settings/PluginSettings";
import { OwlbearSettingsTab } from "src/ui/settings/OwlbearSettingsTab";

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
	};
});

const domMethods = ["empty", "createEl", "createDiv", "appendText"] as const;
let savedDescriptors: Array<PropertyDescriptor | undefined>;
let tab: OwlbearSettingsTab;

beforeEach(() => {
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

function renderSettings(enabled = true, failure = false) {
	const settings = createDefaultPluginSettings();
	settings.owlbearSync = { ...settings.owlbearSync, enabled, port: 43125, developmentExtensionPath: "/dev/bundle" };
	const runtime = {
		cloudflared: { state: failure ? "error" : "ready", version: "2026.5.2", ...(failure ? { error: "Загрузка не удалась" } : {}) },
		tunnel: { state: failure ? "retrying" : "ready", publicHost: "https://test.trycloudflare.com", ...(failure ? { error: "Сбой DNS", diagnostic: "Технический лог" } : {}) },
	};
	const updater = { getStatus: vi.fn(() => ({ state: "current" })), subscribe: vi.fn(() => () => {}), check: vi.fn(), canInstall: vi.fn(() => true) };
	const plugin = {
		app: {}, manifest: { version: "1.2.2" }, getSettings: () => settings,
		getPluginUpdateService: () => updater,
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
	return { plugin, settings, runtime };
}

describe("plugin release settings", () => {
	it("keeps user features and reconnection while hiding development controls and healthy transport details", async () => {
		const { plugin } = renderSettings();
		for (const label of ["Обновления", "Новый интерфейс справочников", "Экспортировать ручные сущности", "Импортировать ручные сущности", "Включить интеграцию", "Ссылка для установки расширения", "Код сопряжения"]) {
			expect(screen.getByText(label)).toBeTruthy();
		}
		for (const label of ["Порт", "Путь к dev bundle"]) expect(screen.queryByText(label)).toBeNull();
		expect(document.body.textContent).not.toContain("Публичный host");
		expect(document.body.textContent).not.toContain("cloudflared");
		await fireEvent.click(screen.getByRole("button", { name: "Перезапустить подключение" }));
		await waitFor(() => expect(plugin.restartOwlbearTunnel).toHaveBeenCalledOnce());
		const toggle = screen.getByText("Новый интерфейс справочников").parentElement!.querySelector("input")!;
		(toggle as HTMLInputElement).checked = true;
		await fireEvent.change(toggle);
		expect(plugin.updateSettings).toHaveBeenCalledWith({ redesignEnabled: true });
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
