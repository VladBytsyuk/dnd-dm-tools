import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import MediaLibraryUi from "src/ui/layout/media/MediaLibraryUi.svelte";
import GlobalPlayerUi from "src/ui/layout/media/GlobalPlayerUi.svelte";
import { MediaNavigation } from "src/ui/layout/media/MediaNavigation";
import { sampleMedia } from "../../../fixtures/media";
import { extractNoteEntityUrls } from "src/ui/layout/media/noteContent";
import { exportAdventureSnapshot, exportPlaylistSnapshot, exportMediaMarkdownBlock, parseMediaSnapshot } from "src/domain/models/media/MediaSnapshot";
import { getMarkdownCodeBlockFromClipboard, writeTextToClipboard } from "src/data/clipboard";
import MediaMarkdownCardUi from "src/ui/layout/media/MediaMarkdownCardUi.svelte";

vi.mock("src/data/clipboard", () => ({ getMarkdownCodeBlockFromClipboard: vi.fn(), writeTextToClipboard: vi.fn() }));

beforeAll(() => {
	vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
	vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function setup(panel: "player" | "adventures" = "player") {
	let state = sampleMedia();
	const mediaListeners = new Set<() => void>(), playbackListeners = new Set<() => void>();
	let snapshot = { playlistId: null, itemId: null, trackId: null, title: null, playlistName: null, nextTrackName: null, hasPrevious: false, playing: false, paused: false, combatMode: false, manualCombat: false, trackerCombat: false, playingVariant: "normal", currentTime: 0, duration: 120, muted: false, volume: 0.6 } as any;
	const playback = { getSnapshot: () => ({ ...snapshot }), subscribe: (fn: () => void) => { playbackListeners.add(fn); return () => playbackListeners.delete(fn); }, play: vi.fn(async () => {}), playTrack: vi.fn(async () => {}), pause: vi.fn(), resume: vi.fn(), stop: vi.fn(() => emit({ playing: false, currentTime: 0 })), clear: vi.fn(() => emit({ trackId: null, itemId: null, playlistId: null })), seek: vi.fn(), setMuted: vi.fn(), setVolume: vi.fn(), setManualCombat: vi.fn(), previous: vi.fn(), next: vi.fn() };
	function emit(patch: object) { snapshot = { ...snapshot, ...patch }; playbackListeners.forEach((fn) => fn()); }
	const files = ["Scenes/Start.md", "Scenes/End.md", "Audio/calm.mp3", "Audio/battle.mp3"].map((path) => ({ path, extension: path.split('.').at(-1), basename: path.split('/').at(-1) }));
	const plugin = {
		getMediaState: () => state, getSettings: () => ({ redesignEnabled: true }), getMediaPlayback: () => playback,
		subscribeMedia: (fn: () => void) => { mediaListeners.add(fn); return () => mediaListeners.delete(fn); },
		updateMedia: vi.fn(async (change: (state: any) => void) => { const next = structuredClone(state); change(next); state = next; mediaListeners.forEach((fn) => fn()); }),
		activateScene: vi.fn(async () => {}), openMediaNote: vi.fn(async () => {}), openMediaUrl: vi.fn(async () => {}),
		panelManager: { resolveEntity: vi.fn(async () => null), openItem: vi.fn() },
		app: { vault: { getMarkdownFiles: () => files.filter((file) => file.extension === "md"), getFiles: () => files, getFileByPath: (path: string) => files.find((file) => file.path === path), cachedRead: vi.fn(async () => ""), on: vi.fn(() => ({})), offref: vi.fn() } },
	};
	const navigation = new MediaNavigation();
	return { plugin, navigation, playback, emit, state: () => state, render: () => render(MediaLibraryUi, { plugin: plugin as any, navigation, panel }) };
}

describe("integrated media screens", () => {
	it.each(["track", "playlist", "scene", "adventure"] as const)("copies a %s block and renders the same full card in Markdown", async (kind) => {
		const test = setup(kind === "track" || kind === "playlist" ? "player" : "adventures");
		const id = kind === "track" ? test.state().tracks[0].id : kind === "playlist" ? "music" : kind === "scene" ? "start" : "quest";
		await test.navigation.open({ kind, id });
		const panel = test.render();
		const copy = await screen.findByRole("button", { name: "Копировать в буфер обмена", exact: true });
		const card = panel.container.querySelector(".content > article")!;
		const appearance = { name: card.getAttribute("aria-label"), className: card.className };
		await fireEvent.click(copy);
		await waitFor(() => expect(writeTextToClipboard).toHaveBeenCalled());
		const block = vi.mocked(writeTextToClipboard).mock.lastCall![0];
		expect(block).toBe(exportMediaMarkdownBlock(test.state(), { kind, id }));
		const snapshot = parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n"));
		panel.unmount(); test.plugin.activateScene.mockClear();
		const embedded = render(MediaMarkdownCardUi, { plugin: test.plugin as any, snapshot });
		const rendered = embedded.container.querySelector(".media-markdown-card > article")!;
		expect({ name: rendered.getAttribute("aria-label"), className: rendered.className }).toEqual(appearance);
		expect(embedded.container.querySelector(".search-bar")).toBeNull();
		expect(test.plugin.activateScene).not.toHaveBeenCalled();
		if (kind === "adventure") {
			expect(embedded.container.querySelectorAll(".svelte-flow__node")).toHaveLength(2);
			expect(embedded.container.querySelector(".svelte-flow__node.draggable")).toBeNull();
			expect(screen.queryByRole("button", { name: "Создать сцену", exact: true })).toBeNull();
		} else if (kind === "scene") {
			await fireEvent.click(screen.getByRole("link", { name: "Scenes/Start.md" }));
			expect(test.plugin.openMediaNote).toHaveBeenCalledWith("Scenes/Start.md");
		} else if (kind === "playlist") {
			await fireEvent.click(screen.getByRole("button", { name: "Открыть трек: Спокойно" }));
			expect(test.plugin.openMediaUrl).toHaveBeenCalledWith(test.state().tracks[0].url);
		} else {
			await fireEvent.click(screen.getByRole("button", { name: "Воспроизвести: Audio/battle.mp3" }));
			expect(test.playback.playTrack).toHaveBeenCalledWith(id, "combat");
		}
	});
	it("renders direct note entities in an embedded scene and opens them through the plugin", async () => {
		const test = setup("adventures");
		test.plugin.app.vault.cachedRead.mockResolvedValue('[Правило](dnd:/screens/rule) [Повтор](dnd:/screens/rule)');
		const entity = { panelKey: "dm-screen", url: "/screens/rule", title: "Укрытие", subtitle: "", item: { name: { rus: "Укрытие", eng: "" }, url: "/screens/rule" } };
		test.plugin.panelManager.resolveEntity.mockResolvedValue(entity as any);
		const block = exportMediaMarkdownBlock(test.state(), { kind: "scene", id: "start" });
		render(MediaMarkdownCardUi, { plugin: test.plugin as any, snapshot: parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n")) });
		await fireEvent.click(await screen.findByRole("button", { name: "Открыть: Укрытие" }));
		expect(screen.getAllByRole("listitem")).toHaveLength(1);
		expect(test.plugin.panelManager.openItem).toHaveBeenCalledWith("dm-screen", entity.item);
	});
	it.each(["playlist", "adventure"] as const)("pastes a %s only in the editor and saves imported dependencies with the draft", async (kind) => {
		const test = setup(kind === "playlist" ? "player" : "adventures"); test.render();
		const before = structuredClone(test.state());
		const source = sampleMedia();
		const value = kind === "playlist" ? source.playlists[0] : source.adventures[0];
		value.name = "Из буфера";
		const exported = (kind === "playlist" ? exportPlaylistSnapshot : exportAdventureSnapshot)(source, value.id);
		vi.mocked(getMarkdownCodeBlockFromClipboard).mockResolvedValueOnce(JSON.parse(exported)).mockResolvedValueOnce(JSON.parse(exported));
		expect(screen.queryByRole("button", { name: /Импортировать|Вставить/ })).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: kind === "playlist" ? "Город" : "Поход", exact: true }));
		expect(screen.queryByRole("button", { name: "Вставить", exact: true })).toBeNull();
		await fireEvent.click(await screen.findByRole("button", { name: "Редактировать", exact: true }));
		const paste = screen.getByRole("button", { name: "Вставить", exact: true });
		expect(paste.closest(".search-bar")).toBeTruthy();
		await fireEvent.click(paste);
		await waitFor(() => expect((screen.getByRole("textbox", { name: "Русское название" }) as HTMLInputElement).value).toBe("Из буфера"));
		expect(test.state()).toEqual(before);
		expect(test.plugin.updateMedia).not.toHaveBeenCalled();
		if (kind === "playlist") expect(screen.getByRole("button", { name: "Открыть трек: Спокойно" })).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		expect(test.state()).toEqual(before);
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Вставить", exact: true }));
		await waitFor(() => expect((screen.getByRole("textbox", { name: "Русское название" }) as HTMLInputElement).value).toBe("Из буфера"));
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect((kind === "playlist" ? test.state().playlists[0] : test.state().adventures[0]).name).toBe("Из буфера"));
		const saved = kind === "playlist" ? test.state().playlists[0] : test.state().adventures[0];
		expect(saved.id).toBe(value.id);
		expect(saved.url).toBe(value.url);
		expect(test.state().tracks.length).toBeGreaterThan(before.tracks.length);
		expect(test.state().adventures).toHaveLength(before.adventures.length);
		if (kind === "playlist") expect(test.state().playlists).toHaveLength(before.playlists.length);
		else {
			expect(test.state().adventures[0].links).toHaveLength(1);
			expect(test.state().adventures[0].scenes[0].trackId).toBeTruthy();
		}
		expect(getMarkdownCodeBlockFromClipboard).toHaveBeenCalledWith(kind);
	});
	it("plays only from the full card search bar and preserves the back stack", async () => {
		const test = setup(); test.render();
		expect(screen.queryByRole("button", { name: /^Воспроизвести/ })).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Город", exact: true }));
		const playlistPlay = await screen.findByRole("button", { name: "Воспроизвести", exact: true });
		expect(playlistPlay.closest(".search-bar")).toBeTruthy();
		expect(screen.getByRole("article", { name: "Город" }).contains(playlistPlay)).toBe(false);
		await fireEvent.click(playlistPlay);
		expect(test.playback.play).toHaveBeenCalledWith("music");
		expect(get(test.navigation.routes)).toEqual([{ kind: "playlist", id: "music" }]);
		await fireEvent.click(await screen.findByRole("button", { name: "Открыть трек: Спокойно" }));
		expect((await screen.findByRole("article", { name: "Спокойно" }))).toBeTruthy();
		const trackPlay = screen.getByRole("button", { name: "Воспроизвести", exact: true });
		expect(trackPlay.closest(".search-bar")).toBeTruthy();
		expect(screen.getByRole("article", { name: "Спокойно" }).contains(trackPlay)).toBe(false);
		await fireEvent.click(trackPlay);
		expect(test.playback.playTrack).toHaveBeenCalledWith(test.state().playlists[0].items[0].trackId);
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		expect(await screen.findByRole("article", { name: "Город" })).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		expect(await screen.findByRole("button", { name: "Добавить: Треки" })).toBeTruthy();
	});
	it("disables the search bar Play while editing or when the playlist is empty", async () => {
		const test = setup(); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Город", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Редактировать", exact: true }));
		expect((screen.getByRole("button", { name: "Воспроизвести", exact: true }) as HTMLButtonElement).disabled).toBe(true);
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		expect((screen.getByRole("button", { name: "Воспроизвести", exact: true }) as HTMLButtonElement).disabled).toBe(false);
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		await test.plugin.updateMedia((state) => { state.playlists[0].items = []; });
		await fireEvent.click(await screen.findByRole("button", { name: "Город", exact: true }));
		expect((await screen.findByRole("button", { name: "Воспроизвести", exact: true }) as HTMLButtonElement).disabled).toBe(true);
	});
	it("creates a track through a file picker, saves repeat on, and cancels new drafts", async () => {
		const test = setup(); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить: Треки" }));
		await fireEvent.input(await screen.findByRole("textbox", { name: "Русское название" }), { target: { value: "Дождь" } });
		await fireEvent.click(screen.getByRole("button", { name: "Добавить аудиофайл: Основной" }));
		await fireEvent.click(await screen.findByRole("option", { name: "Audio/calm.mp3" }));
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().tracks.some((track) => track.name === "Дождь" && track.loop && track.normalAudioId === "calm")).toBe(true));
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Добавить: Треки" }));
		await fireEvent.click(await screen.findByRole("button", { name: "Отмена", exact: true }));
		expect(test.state().tracks).toHaveLength(4);
	});
	it("keeps a dirty editor when navigation is cancelled, and discards only its draft", async () => {
		const test = setup(); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Город", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Черновик" } });
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Остаться", exact: true }));
		expect((screen.getByRole("textbox", { name: "Русское название" }) as HTMLInputElement).value).toBe("Черновик");
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Не сохранять", exact: true }));
		expect(await screen.findByRole("button", { name: "Город", exact: true })).toBeTruthy();
		expect(test.state().playlists[0].name).toBe("Город");
	});
	it("groups campaigns and creates a scene with a required parent but without a note", async () => {
		const test = setup("adventures"); test.state().adventures[0].campaignName = "Культ"; test.render();
		expect(screen.getByText("Культ", { selector: "summary" })).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Поход", exact: true }));
		expect(screen.queryByRole("button", { name: "Добавить сцену", exact: true })).toBeNull();
		expect(screen.queryByRole("button", { name: "Создать сцену", exact: true })).toBeNull();
		await fireEvent.click(await screen.findByRole("button", { name: "Редактировать", exact: true }));
		expect((screen.getByRole("button", { name: "Создать сцену", exact: true }) as HTMLButtonElement).disabled).toBe(false);
		await fireEvent.click(await screen.findByRole("button", { name: "Создать сцену", exact: true }));
		await fireEvent.input(await screen.findByRole("textbox", { name: "Русское название" }), { target: { value: "Засада" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().adventures[0].scenes.find((scene) => scene.name === "Засада")?.notePath).toBeNull());
		expect(test.state().adventures[0].scenes).toHaveLength(3);
	});
	it("opens note chips through the Obsidian callback and keeps graph mutation disabled in view", async () => {
		const test = setup("adventures"); await test.navigation.open({ kind: "scene", id: "start", adventureId: "quest" }); test.render();
		await fireEvent.click(await screen.findByRole("link", { name: "Scenes/Start.md" }));
		expect(test.plugin.openMediaNote).toHaveBeenCalledWith("Scenes/Start.md");
		expect(test.plugin.activateScene).toHaveBeenCalledWith("quest", "start");
		expect(test.plugin.updateMedia).not.toHaveBeenCalled();
	});
	it("uses the current owner after a scene has moved, even with an older history entry", async () => {
		const test = setup("adventures");
		test.state().adventures[0].id = "new-parent";
		await test.navigation.open({ kind: "scene", id: "start", adventureId: "quest" }); test.render();
		await waitFor(() => expect(test.plugin.activateScene).toHaveBeenCalledWith("new-parent", "start"));
	});
	it("discards a new scene and returns to its adventure without leaving a missing route", async () => {
		const test = setup("adventures"); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Поход", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Создать сцену", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Назад", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Не сохранять", exact: true }));
		expect(await screen.findByRole("article", { name: "Поход" })).toBeTruthy();
		expect(get(test.navigation.routes)).toEqual([{ kind: "adventure", id: "quest" }]);
	});
	it("keeps loaded Player expanded after Stop and collapses only on explicit clear", async () => {
		const test = setup(); render(GlobalPlayerUi, { playback: test.playback as any, onVolumeChange: vi.fn() });
		expect(screen.getByText("Плеер · Ничего не выбрано")).toBeTruthy();
		test.emit({ trackId: "track", title: "Музыка", playing: true });
		await fireEvent.click(await screen.findByRole("button", { name: "Остановить", exact: true }));
		expect(screen.queryByText("Плеер · Ничего не выбрано")).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Очистить плеер", exact: true }));
		expect(await screen.findByText("Плеер · Ничего не выбрано")).toBeTruthy();
	});
});

describe("direct note links", () => {
	it("preserves first occurrence and excludes code and comments", () => {
		const text = '[А](dnd:/bestiary/a) [А](dnd:/bestiary/a)\n`[Нет](dnd:/spells/no)`\n```md\n[Нет](dnd:/spells/code)\n```\n    [Нет](dnd:/spells/indent)\n<!-- [Нет](dnd:/spells/comment) -->\n[Трек](dnd:/track/music)\n<a href="dnd:/items/rope">Верёвка</a>';
		expect(extractNoteEntityUrls(text)).toEqual(["/bestiary/a", "/track/music", "/items/rope"]);
	});
	it("excludes links in multiline inline code", () => {
		expect(extractNoteEntityUrls('`code\n[Скрыто](dnd:/track/hidden)\ncode`\n[Видно](dnd:/track/visible)')).toEqual(["/track/visible"]);
	});
});
