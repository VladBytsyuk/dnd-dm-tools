import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import MediaLibraryUi from "src/ui/layout/media/MediaLibraryUi.svelte";
import GlobalPlayerUi from "src/ui/layout/media/GlobalPlayerUi.svelte";
import { MediaNavigation } from "src/ui/layout/media/MediaNavigation";
import { sampleMedia } from "../../../fixtures/media";
import { extractNoteEntityUrls, extractNoteEncounterBlocks } from "src/ui/layout/media/noteContent";
import { Component, MarkdownRenderer } from "obsidian";
import { exportAdventureSnapshot, exportPlaylistSnapshot, exportMediaMarkdownBlock, parseMediaSnapshot } from "src/domain/models/media/MediaSnapshot";
import { getMarkdownCodeBlockFromClipboard, writeTextToClipboard } from "src/data/clipboard";
import MediaMarkdownCardUi from "src/ui/layout/media/MediaMarkdownCardUi.svelte";
import { createMediaScene, createMediaAdventure, loadMediaState } from "src/domain/models/media/MediaState";
import { AdventuresPanel } from "src/ui/components/sidepanel/MediaPanels";

vi.mock("src/data/clipboard", () => ({ getMarkdownCodeBlockFromClipboard: vi.fn(), writeTextToClipboard: vi.fn() }));

beforeAll(() => {
	vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
	vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.restoreAllMocks(); });
function setup(panel: "player" | "adventures" = "player") {
	let state = sampleMedia();
	const mediaListeners = new Set<() => void>(), playbackListeners = new Set<() => void>();
	let snapshot = { sourceId: null, playlistId: null, itemId: null, trackId: null, title: null, playlistName: null, nextTrackName: null, hasPrevious: false, playing: false, paused: false, combatMode: false, combatModeLocked: false, manualCombat: false, trackerCombat: false, playingVariant: "normal", currentTime: 0, duration: 120, muted: false, volume: 0.6 } as any;
	const playback = { getSnapshot: () => ({ ...snapshot }), subscribe: (fn: () => void) => { playbackListeners.add(fn); return () => playbackListeners.delete(fn); }, play: vi.fn(async () => {}), playTrack: vi.fn(async () => {}), playTrackSnapshot: vi.fn(async (..._args: any[]) => {}), pause: vi.fn(), resume: vi.fn(), stop: vi.fn(() => emit({ playing: false, currentTime: 0 })), clear: vi.fn(() => emit({ sourceId: null, trackId: null, itemId: null, playlistId: null })), seek: vi.fn(), setMuted: vi.fn(), setVolume: vi.fn(), setManualCombat: vi.fn(), previous: vi.fn(), next: vi.fn() };
	function emit(patch: object) { snapshot = { ...snapshot, ...patch }; playbackListeners.forEach((fn) => fn()); }
	const files = ["Scenes/Start.md", "Scenes/End.md", "Audio/calm.mp3", "Audio/battle.mp3"].map((path) => ({ path, extension: path.split('.').at(-1), basename: path.split('/').at(-1) }));
	const plugin = {
		getMediaState: () => state, getMediaPlayback: () => playback,
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
	it.each([
		["scene", "panel"], ["adventure", "panel"], ["scene", "markdown"], ["adventure", "markdown"],
	] as const)("appends full encounters after %s entities in %s and refreshes them when the note changes", async (kind, mode) => {
		const test = setup("adventures");
		test.state().adventures[0].notePath = "Scenes/Start.md";
		const path = "Scenes/Start.md", id = kind === "scene" ? "start" : "quest";
		const markdown = '[Правило](dnd:/screens/rule)\n```encounter\nname: Засада\nparticipants: []\n```\n~~~encounter\nname: Погоня\nparticipants: []\n~~~';
		test.plugin.app.vault.cachedRead.mockResolvedValue(markdown);
		test.plugin.panelManager.resolveEntity.mockResolvedValue({ panelKey: "dm-screen", url: "/screens/rule", title: "Укрытие", subtitle: "", item: { name: { rus: "Укрытие", eng: "" }, url: "/screens/rule" } } as any);
		const renderer = vi.spyOn(MarkdownRenderer, "render"), unload = vi.spyOn(Component.prototype, "unload");
		let view;
		if (mode === "panel") { await test.navigation.open({ kind, id }); view = test.render(); }
		else {
			const block = exportMediaMarkdownBlock(test.state(), { kind, id });
			view = render(MediaMarkdownCardUi, { plugin: test.plugin as any, snapshot: parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n")) });
		}
		await waitFor(() => expect(renderer).toHaveBeenCalledTimes(2));
		const card = view.container.querySelector(kind === "scene" ? ".full-scene" : ".full-adventure")!;
		const list = card.querySelector(kind === "scene" ? ".scene-content" : ".adventure-content")!;
		expect(list.nextElementSibling?.classList.contains("note-encounters")).toBe(true);
		expect(card.querySelectorAll(".encounter-block")).toHaveLength(2);
		expect(renderer.mock.calls.map((args) => args[1])).toEqual(extractNoteEncounterBlocks(markdown));
		expect(renderer.mock.calls.every((args) => args[3] === path)).toBe(true);
		test.plugin.app.vault.cachedRead.mockResolvedValue('```encounter\nname: Новое столкновение\nparticipants: []\n```');
		const refresh = test.plugin.app.vault.on.mock.calls.find((args: unknown[]) => args[0] === "modify")![1] as () => void;
		await act(() => refresh());
		await waitFor(() => expect(card.querySelectorAll(".encounter-block")).toHaveLength(1));
		expect(card.textContent).toContain("Новое столкновение");
		expect(card.textContent).not.toContain("В заметке нет ссылок на сущности плагина");
		expect(unload.mock.calls.length).toBeGreaterThanOrEqual(2);
		view.unmount();
		expect(unload.mock.calls.length).toBeGreaterThanOrEqual(3);
	});
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
		if (kind === "track") await test.plugin.updateMedia((state) => { state.tracks = []; state.audioFiles = []; });
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
			expect(test.playback.playTrackSnapshot).toHaveBeenCalledWith(
				expect.objectContaining({ id }), expect.arrayContaining([expect.objectContaining({ path: "Audio/battle.mp3" })]), expect.any(String), "combat",
			);
			expect(test.playback.playTrack).not.toHaveBeenCalled();
		}
	});
	it("isolates playback indicators between two embedded snapshots and a library track with the same ID", async () => {
		const test = setup();
		const track = test.state().tracks[0];
		const block = exportMediaMarkdownBlock(test.state(), { kind: "track", id: track.id });
		const snapshot = parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n"));
		await test.navigation.open({ kind: "track", id: track.id });
		const library = test.render();
		const first = render(MediaMarkdownCardUi, { plugin: test.plugin as any, snapshot });
		const second = render(MediaMarkdownCardUi, { plugin: test.plugin as any, snapshot });
		await fireEvent.click(within(first.container).getByRole("button", { name: "Воспроизвести: Audio/calm.mp3" }));
		const firstId = test.playback.playTrackSnapshot.mock.lastCall![2];
		await act(() => test.emit({ sourceId: firstId, trackId: track.id, playing: true, playingVariant: "normal", currentTime: 30 }));
		expect(within(first.container).getByRole("button", { name: "Остановить: Audio/calm.mp3" })).toBeTruthy();
		expect(within(second.container).getByRole("button", { name: "Воспроизвести: Audio/calm.mp3" })).toBeTruthy();
		expect(within(library.container).getByRole("button", { name: "Воспроизвести: Audio/calm.mp3" })).toBeTruthy();
		expect(first.container.textContent).toContain("00:30 / 02:00");
		expect(second.container.textContent).not.toContain("00:30 / 02:00");
		await fireEvent.click(within(second.container).getByRole("button", { name: "Воспроизвести: Audio/calm.mp3" }));
		const secondId = test.playback.playTrackSnapshot.mock.lastCall![2];
		expect(secondId).not.toBe(firstId);
		await act(() => test.emit({ sourceId: secondId }));
		expect(within(first.container).getByRole("button", { name: "Воспроизвести: Audio/calm.mp3" })).toBeTruthy();
		expect(within(second.container).getByRole("button", { name: "Остановить: Audio/calm.mp3" })).toBeTruthy();
		await act(() => test.emit({ sourceId: null }));
		expect(within(library.container).getByRole("button", { name: "Остановить: Audio/calm.mp3" })).toBeTruthy();
		expect(within(second.container).getByRole("button", { name: "Воспроизвести: Audio/calm.mp3" })).toBeTruthy();
		expect(test.plugin.updateMedia).not.toHaveBeenCalled();
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
			expect(test.state().scenes.find((scene) => scene.id === test.state().adventures[0].scenes[0].id)?.trackId).toBeTruthy();
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
	it.each(["Сохранить", "Отмена"])("offers scene creation and selection only while editing an adventure, including after %s", async (finish) => {
		const test = setup("adventures"); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Поход", exact: true }));
		for (const name of ["Создать сцену", "Добавить существующую сцену", "Добавить сцену"])
			expect(screen.queryByRole("button", { name, exact: true })).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		expect((screen.getByRole("button", { name: "Создать сцену" }) as HTMLButtonElement).disabled).toBe(false);
		await fireEvent.click(screen.getByRole("combobox", { name: "Добавить существующую сцену" }));
		expect(screen.getByRole("listbox", { name: "Добавить существующую сцену" })).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: finish, exact: true }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		for (const name of ["Создать сцену", "Добавить существующую сцену", "Добавить сцену"])
			expect(screen.queryByRole("button", { name, exact: true })).toBeNull();
		expect(screen.queryByRole("combobox", { name: "Добавить существующую сцену" })).toBeNull();
		expect(test.state().scenes).toHaveLength(2);
	});
	it("creates a shared scene from an adventure without requiring a note", async () => {
		const test = setup("adventures"); test.state().adventures[0].campaignName = "Культ"; test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Поход", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Создать сцену", exact: true }));
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Засада" } });
		expect(screen.getByLabelText("Приключения сцены").textContent).toBe("Поход");
		expect(screen.queryByRole("combobox", { name: "Приключения" })).toBeNull();
		expect((screen.getByRole("combobox", { name: "Кампания" }) as HTMLInputElement).value).toBe("Культ");
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().scenes.find((scene) => scene.name === "Засада")?.notePath).toBeNull());
		expect(test.state().scenes).toHaveLength(3);
		expect(test.state().adventures[0].scenes).toHaveLength(3);
	});
	it.each([false, true])("adds an existing scene with prior membership %s without moving or copying it", async (shared) => {
		const test = setup("adventures"), scene = createMediaScene("Засада", "existing");
		scene.notePath = "Scenes/Start.md"; scene.trackId = test.state().tracks[0].id; scene.campaignName = "Своя";
		test.state().scenes.push(scene);
		if (shared) {
			const other = createMediaAdventure("Другой поход", "other");
			other.scenes = [{ id: scene.id, position: { x: 800, y: 400 } }, { id: "end", position: { x: 1000, y: 600 } }];
			other.links = [{ id: "other-link", fromSceneId: scene.id, toSceneId: "end" }]; test.state().adventures.push(other);
		}
		const before = structuredClone(test.state()), view = test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Поход", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.click(screen.getByRole("combobox", { name: "Добавить существующую сцену", exact: true }));
		const label = shared ? "Засада · Другой поход · Своя" : "Засада · Своя";
		expect(screen.queryByRole("option", { name: /^Start/ })).toBeNull();
		await fireEvent.click(screen.getByRole("option", { name: label, exact: true }));
		expect(view.container.querySelectorAll(".svelte-flow__node")).toHaveLength(3);
		expect(test.state()).toEqual(before);
		await fireEvent.click(screen.getByRole("combobox", { name: "Добавить существующую сцену", exact: true }));
		expect(screen.queryByRole("option", { name: label, exact: true })).toBeNull();
		await fireEvent.keyDown(screen.getByRole("combobox", { name: "Добавить существующую сцену" }), { key: "Escape" });
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		expect(test.state()).toEqual(before);
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.click(screen.getByRole("combobox", { name: "Добавить существующую сцену", exact: true }));
		await fireEvent.click(screen.getByRole("option", { name: label, exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().adventures[0].scenes).toHaveLength(3));
		expect(test.state().scenes).toEqual(before.scenes);
		expect(test.state().adventures[0].scenes[2]).toEqual({ id: scene.id, position: expect.any(Object) });
		if (shared) expect(test.state().adventures[1]).toEqual(before.adventures[1]);
		await fireEvent.click(view.container.querySelector('.svelte-flow__node[data-id="existing"]')!);
		expect(await screen.findByRole("article", { name: "Засада" })).toBeTruthy();
		expect(screen.getByLabelText("Кампания").textContent).toBe("Своя");
	});
	it("selects shared scenes before saving a new adventure and excludes already added references", async () => {
		const test = setup("adventures"); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить", exact: true }));
		expect((screen.getByRole("button", { name: "Создать сцену" }) as HTMLButtonElement).disabled).toBe(false);
		await fireEvent.click(screen.getByRole("combobox", { name: "Добавить существующую сцену" }));
		await fireEvent.click(screen.getByRole("option", { name: "Start · Поход", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().adventures).toHaveLength(2));
		expect(test.state().adventures[0].scenes.map((scene) => scene.id)).toEqual(["start", "end"]);
		expect(test.state().adventures[1].scenes[0].id).toBe("start");
		expect(test.state().scenes).toHaveLength(2);
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.click(screen.getByRole("combobox", { name: "Добавить существующую сцену" }));
		await fireEvent.click(screen.getByRole("option", { name: "End · Поход", exact: true }));
		await fireEvent.click(screen.getByRole("combobox", { name: "Добавить существующую сцену" }));
		expect(screen.getByText("Нет подсказок")).toBeTruthy();
	});
	it("creates a scene while creating an adventure after saving its draft", async () => {
		const test = setup("adventures"); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить", exact: true }));
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Новый поход" } });
		await fireEvent.input(screen.getByRole("combobox", { name: "Кампания" }), { target: { value: "Культ" } });
		await fireEvent.click(screen.getByRole("button", { name: "Создать сцену", exact: true }));
		expect(test.state().adventures).toHaveLength(1);
		const dialog = screen.getByRole("dialog", { name: "Несохранённые изменения" });
		await fireEvent.click(within(dialog).getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().adventures).toHaveLength(2));
		await waitFor(() => expect(get(test.navigation.routes).at(-1)?.kind).toBe("scene"));
		expect((screen.getByRole("combobox", { name: "Кампания" }) as HTMLInputElement).value).toBe("Культ");
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Засада" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().scenes).toHaveLength(3));
		expect(test.state().adventures[1]).toMatchObject({ name: "Новый поход", scenes: [{ id: test.state().scenes[2].id }] });
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		expect(screen.getByRole("article", { name: "Новый поход" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Создать сцену" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Добавить существующую сцену" })).toBeNull();
	});
	it.each(["Остаться", "Не сохранять"])("does not create an orphaned scene when choosing %s for a new adventure", async (choice) => {
		const test = setup("adventures"); test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Создать сцену", exact: true }));
		const dialog = screen.getByRole("dialog", { name: "Несохранённые изменения" });
		await fireEvent.click(within(dialog).getByRole("button", { name: choice, exact: true }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(test.state().adventures).toHaveLength(1);
		expect(test.state().scenes).toHaveLength(2);
		expect(get(test.navigation.routes).some((route) => route.kind === "scene")).toBe(false);
		if (choice === "Остаться") expect(screen.getByRole("button", { name: "Создать сцену" })).toBeTruthy();
		else expect(get(test.navigation.routes)).toEqual([]);
	});
	it("sorts adventures alphabetically within each campaign and updates after renaming", async () => {
		const test = setup("adventures");
		test.state().adventures = ["Кампания", ""].flatMap((campaignName, group) => ["Ярмарка", "Аванпост", "Болото"].map((name, index) => ({ ...createMediaAdventure(name, `${group}-${index}`), campaignName })));
		const before = structuredClone(test.state().adventures);
		const view = test.render();
		const titles = () => [...view.container.querySelectorAll("details")].map((group) => [...group.querySelectorAll(".small-adventure [role=button]")].map((card) => card.getAttribute("aria-label")));
		expect(titles()).toEqual([["Аванпост", "Болото", "Ярмарка"], ["Аванпост", "Болото", "Ярмарка"]]);
		expect(test.state().adventures).toEqual(before);
		await act(() => test.plugin.updateMedia((state) => { state.adventures[0].name = "Аа"; }));
		expect(titles()[0]).toEqual(["Аа", "Аванпост", "Болото"]);
	});
	it.each(["Кампания", ""])("sorts scenes by adventure then scene name in campaign '%s'", async (campaignName) => {
		const test = setup("adventures");
		test.state().scenes = ["Яма", "Брод", "Засада", "Арка", "Храм", "Башня", "Алтарь"].map((name, index) => ({ ...createMediaScene(name, `scene-${index}`), campaignName }));
		const later = createMediaAdventure("Ярмарка", "later"), earlier = createMediaAdventure("Аванпост", "earlier");
		later.scenes = [0, 1, 4].map((index) => ({ id: `scene-${index}`, position: { x: 0, y: 0 } }));
		earlier.scenes = [2, 3, 4].map((index) => ({ id: `scene-${index}`, position: { x: 0, y: 0 } }));
		test.state().adventures = [later, earlier];
		const before = structuredClone(test.state());
		const view = test.render();
		await fireEvent.click(screen.getByRole("tab", { name: "Сцены" }));
		const titles = () => [...view.container.querySelectorAll(".small-scene [role=button]")].map((card) => card.getAttribute("aria-label"));
		expect(titles()).toEqual(["Арка", "Засада", "Храм", "Брод", "Яма", "Алтарь", "Башня"]);
		expect(test.state()).toEqual(before);
		await fireEvent.input(screen.getByRole("textbox", { name: "Поиск в справочнике" }), { target: { value: "Аванпост" } });
		await waitFor(() => expect(titles()).toEqual(["Арка", "Засада", "Храм"]));
		await fireEvent.click(screen.getByRole("button", { name: "Очистить поиск", exact: true }));
		await act(() => test.plugin.updateMedia((state) => { state.adventures[0].name = "Аа"; }));
		expect(titles()).toEqual(["Брод", "Храм", "Яма", "Арка", "Засада", "Алтарь", "Башня"]);
	});
	it("lists shared scenes once, groups by their own campaigns and remembers the selected tab", async () => {
		const test = setup("adventures"); test.state().scenes.forEach((scene) => scene.campaignName = "Культ");
		const solo = createMediaScene("Таверна", "solo"); solo.campaignName = "Альфа";
		test.state().scenes.push(solo, createMediaScene("Пустошь", "empty"));
		const other = createMediaAdventure("Другой", "other"); other.scenes = [{ id: "start", position: { x: 900, y: 400 } }]; test.state().adventures.push(other);
		const view = test.render();
		expect(screen.getByRole("tab", { name: "Приключения" }).getAttribute("aria-selected")).toBe("true");
		expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(screen.getByRole("tab", { name: "Приключения" }).id);
		await fireEvent.keyDown(screen.getByRole("tab", { name: "Приключения" }), { key: "ArrowRight" });
		expect([...view.container.querySelectorAll("summary")].map((item) => item.textContent?.trim())).toEqual(["Альфа", "Культ", "Без кампании"]);
		expect(view.container.querySelectorAll(".small-scene")).toHaveLength(4);
		await fireEvent.input(screen.getByRole("textbox", { name: "Поиск в справочнике" }), { target: { value: "Культ" } });
		await waitFor(() => expect(view.container.querySelectorAll(".small-scene")).toHaveLength(2));
		await fireEvent.click(screen.getByRole("button", { name: "Очистить поиск", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Таверна", exact: true }));
		await waitFor(() => expect(test.plugin.activateScene).toHaveBeenCalledWith(null, "solo"));
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		expect(screen.getByRole("tab", { name: "Сцены" }).getAttribute("aria-selected")).toBe("true");
		view.unmount(); test.render();
		expect(screen.getByRole("tab", { name: "Сцены" }).getAttribute("aria-selected")).toBe("true");
	});
	it.each(["scene", "adventure"] as const)("suggests unique existing campaigns from scenes and adventures in the %s editor", async (kind) => {
		const test = setup("adventures");
		test.state().scenes[0].campaignName = "  Культ  ";
		test.state().scenes[1].campaignName = "Своя";
		test.state().adventures[0].campaignName = "Культ";
		await test.navigation.open({ kind, id: kind === "scene" ? "start" : "quest" });
		test.render();
		expect(screen.queryByRole("combobox", { name: "Кампания" })).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		const input = screen.getByRole("combobox", { name: "Кампания" });
		await fireEvent.input(input, { target: { value: "" } });
		expect(screen.getAllByRole("option").map((item) => item.textContent)).toEqual(["Культ", "Своя"]);
		await fireEvent.input(input, { target: { value: "СВО" } });
		await fireEvent.keyDown(input, { key: "ArrowDown" });
		await fireEvent.keyDown(input, { key: "Enter" });
		expect((input as HTMLInputElement).value).toBe("Своя");
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect((kind === "scene" ? test.state().scenes[0] : test.state().adventures[0]).campaignName).toBe("Своя"));
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(screen.getByRole("combobox", { name: "Кампания" }), { target: { value: "Совсем новая" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect((kind === "scene" ? test.state().scenes[0] : test.state().adventures[0]).campaignName).toBe("Совсем новая"));
	});
	it("creates, edits, reloads and deletes a scene and cancels a new draft", async () => {
		const test = setup("adventures"), before = structuredClone(test.state().scenes); test.render();
		await fireEvent.click(screen.getByRole("tab", { name: "Сцены" }));
		await fireEvent.click(screen.getByRole("button", { name: "Добавить", exact: true }));
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Засада" } });
		await fireEvent.input(screen.getByRole("combobox", { name: "Кампания" }), { target: { value: "Культ" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().scenes).toHaveLength(3));
		expect(test.state().scenes[2]).toMatchObject({ name: "Засада", campaignName: "Культ", notePath: null });
		expect(loadMediaState(JSON.parse(JSON.stringify(test.state())))).toEqual(test.state());
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Погоня" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().scenes[2].name).toBe("Погоня"));
		await fireEvent.click(screen.getByRole("button", { name: "Удалить", exact: true }));
		await waitFor(() => expect(test.state().scenes).toEqual(before));
		await fireEvent.click(screen.getByRole("button", { name: "Добавить", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		expect(test.state().scenes).toEqual(before);
		expect(get(test.navigation.routes)).toEqual([]);
	});
	it("edits a shared scene globally while keeping each adventure's graph positions", async () => {
		const test = setup("adventures"), other = createMediaAdventure("Другой поход", "other");
		other.scenes = [{ id: "start", position: { x: 900, y: 400 } }]; test.state().adventures.push(other);
		const positions = test.state().adventures.map((adventure) => structuredClone(adventure.scenes));
		const view = test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Поход", exact: true }));
		await fireEvent.click(view.container.querySelector('.svelte-flow__node[data-id="start"]')!);
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		expect(screen.queryByRole("button", { name: "Приключение", exact: true })).toBeNull();
		expect(screen.getByLabelText("Приключения сцены").textContent).toBe("Поход, Другой поход");
		expect(screen.queryByRole("combobox", { name: "Приключения" })).toBeNull();
		expect(screen.queryByRole("button", { name: /^Убрать приключение:/ })).toBeNull();
		await fireEvent.input(screen.getByRole("combobox", { name: "Кампания" }), { target: { value: "Своя" } });
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Общий храм" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().scenes[0].name).toBe("Общий храм"));
		expect(test.state().scenes[0].campaignName).toBe("Своя");
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		expect(view.container.querySelector('.svelte-flow__node[data-id="start"]')?.textContent).toContain("Общий храм");
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Другой поход", exact: true }));
		expect(view.container.querySelector('.svelte-flow__node[data-id="start"]')?.textContent).toContain("Общий храм");
		expect(test.state().adventures.map((adventure) => adventure.scenes)).toEqual(positions);
	});
	it("removes graph references and adventures without deleting shared scenes", async () => {
		const test = setup("adventures"), other = createMediaAdventure("Другой поход", "other");
		other.scenes = [{ id: "start", position: { x: 900, y: 400 } }]; test.state().adventures.push(other);
		const view = test.render(), before = structuredClone(test.state().scenes);
		await fireEvent.click(screen.getByRole("button", { name: "Поход", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.click(view.container.querySelector('.svelte-flow__node[data-id="start"]')!);
		await fireEvent.click(screen.getByRole("button", { name: "Удалить выделенное" }));
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.state().adventures[0].scenes.map((scene) => scene.id)).toEqual(["end"]));
		expect(test.state().scenes).toEqual(before);
		expect(test.state().adventures[1].scenes).toEqual(other.scenes);
		expect(test.state().adventures[0].links).toEqual([]);
		await fireEvent.click(screen.getByRole("button", { name: "Удалить", exact: true }));
		await waitFor(() => expect(test.state().adventures).toHaveLength(1));
		expect(test.state().scenes).toEqual(before);
		await act(() => test.navigation.open({ kind: "scene", id: "start" }));
		await fireEvent.click(screen.getByRole("button", { name: "Удалить", exact: true }));
		await waitFor(() => expect(test.state().scenes.map((scene) => scene.id)).toEqual(["end"]));
		expect(test.state().adventures[0].scenes).toEqual([]);
	});
	it("resolves scene URLs and campaigns and renders their copied Markdown cards", async () => {
		const test = setup("adventures"), scene = createMediaScene("Засада", "solo");
		scene.campaignName = "Культ"; scene.notePath = "Scenes/Start.md"; test.state().scenes.push(scene);
		const panel = new AdventuresPanel(test.plugin as any);
		expect(await panel.resolveItem(scene.url)).toMatchObject({ record: scene });
		expect((await panel.search("Культ")).map((item) => item.url)).toContain(scene.url);
		await test.navigation.open({ kind: "scene", id: scene.id });
		const view = test.render();
		await fireEvent.click(screen.getByRole("button", { name: "Копировать в буфер обмена", exact: true }));
		await waitFor(() => expect(writeTextToClipboard).toHaveBeenCalled());
		const block = vi.mocked(writeTextToClipboard).mock.lastCall![0];
		view.unmount(); test.plugin.activateScene.mockClear();
		render(MediaMarkdownCardUi, { plugin: test.plugin as any, snapshot: parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n")) });
		expect(screen.getByRole("article", { name: "Засада" })).toBeTruthy();
		expect(screen.getByLabelText("Кампания").textContent).toBe("Культ");
		expect(test.plugin.activateScene).not.toHaveBeenCalled();
	});
	it("opens note chips and retains the adventure context when entering a shared scene", async () => {
		const test = setup("adventures"); await test.navigation.open({ kind: "scene", id: "start", adventureId: "quest" }); test.render();
		await fireEvent.click(await screen.findByRole("link", { name: "Scenes/Start.md" }));
		expect(test.plugin.openMediaNote).toHaveBeenCalledWith("Scenes/Start.md");
		expect(test.plugin.activateScene).toHaveBeenCalledWith("quest", "start");
	});
	it("switches the active context when the same shared scene is opened from another adventure", async () => {
		const test = setup("adventures"), other = createMediaAdventure("Другой", "other");
		other.scenes = [{ id: "start", position: { x: 800, y: 400 } }]; test.state().adventures.push(other);
		await test.navigation.open({ kind: "scene", id: "start", adventureId: "quest" }); test.render();
		await waitFor(() => expect(test.plugin.activateScene).toHaveBeenLastCalledWith("quest", "start"));
		await act(() => test.navigation.open({ kind: "scene", id: "start", adventureId: "other" }));
		await waitFor(() => expect(test.plugin.activateScene).toHaveBeenLastCalledWith("other", "start"));
		await act(() => test.navigation.back());
		await waitFor(() => expect(test.plugin.activateScene).toHaveBeenLastCalledWith("quest", "start"));
	});
	it("drops obsolete adventure context without assigning another adventure as owner", async () => {
		const test = setup("adventures"); test.state().adventures[0].id = "new-parent";
		await test.navigation.open({ kind: "scene", id: "start", adventureId: "quest" }); test.render();
		await waitFor(() => expect(test.plugin.activateScene).toHaveBeenCalledWith(null, "start"));
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
	it.each([false, true])("disables the global combat switch with forced mode %s until the lock is removed", async (combatMode) => {
		const test = setup();
		test.emit({ trackId: "track", title: "Музыка", combatMode, combatModeLocked: true });
		render(GlobalPlayerUi, { playback: test.playback as any, onVolumeChange: vi.fn() });
		const combat = screen.getByRole("button", { name: "Боевой режим" }) as HTMLButtonElement;
		expect(combat.disabled).toBe(true);
		await fireEvent.click(combat);
		expect(test.playback.setManualCombat).not.toHaveBeenCalled();
		await act(() => test.emit({ trackId: "next-track", title: "Таверна", combatMode: !combatMode, combatModeLocked: false }));
		expect(combat.disabled).toBe(false);
		expect(combat.getAttribute("aria-pressed")).toBe(String(!combatMode));
		await fireEvent.click(combat);
		expect(test.playback.setManualCombat).toHaveBeenCalledWith(combatMode);
	});
});

describe("direct note links", () => {
	it("extracts encounter fences in order without interpreting examples or comments as encounters", () => {
		const first = '```encounter\nname: Первый\nparticipants: []\n```';
		const second = '~~~encounter\nname: Второй\nparticipants: []\n~~~';
		const example = '````markdown\n```encounter\nname: Пример\nparticipants: []\n```\n````';
		expect(extractNoteEncounterBlocks([example, first, `<!-- ${second} -->`, second].join("\n"))).toEqual([first, second]);
		expect(extractNoteEncounterBlocks('```encounter\nname: Незакрытый\nparticipants: []')).toEqual(['```encounter\nname: Незакрытый\nparticipants: []\n```']);
	});
	it("preserves first occurrence and excludes code and comments", () => {
		const text = '[А](dnd:/bestiary/a) [А](dnd:/bestiary/a)\n`[Нет](dnd:/spells/no)`\n```md\n[Нет](dnd:/spells/code)\n```\n    [Нет](dnd:/spells/indent)\n<!-- [Нет](dnd:/spells/comment) -->\n[Трек](dnd:/track/music)\n<a href="dnd:/items/rope">Верёвка</a>';
		expect(extractNoteEntityUrls(text)).toEqual(["/bestiary/a", "/track/music", "/items/rope"]);
	});
	it("excludes links in multiline inline code", () => {
		expect(extractNoteEntityUrls('`code\n[Скрыто](dnd:/track/hidden)\ncode`\n[Видно](dnd:/track/visible)')).toEqual(["/track/visible"]);
	});
});
