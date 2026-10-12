import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Track from "../../../design-system/src/lib/Track.svelte";

const names = { russianName: "Подземный тоннель", entityLink: "/track/underdark_tunnel" };

describe("Track", () => {
	it("edits the header fields and keeps their values when leaving edit mode", async () => {
		const { rerender } = render(Track, {
			...names, editable: true, atmosphere: "Холодное",
			source: { shortName: "PHB", name: "Handbook", group: { shortName: "5e", name: "D&D" } },
		});
		expect(screen.queryByLabelText("Английское название")).toBeNull();
		await fireEvent.input(screen.getByRole("textbox", { name: "Русское название" }), { target: { value: "Забытый храм" } });
		await fireEvent.input(screen.getByRole("textbox", { name: "Ссылка на сущность" }), { target: { value: "/track/temple" } });
		await fireEvent.input(screen.getByRole("textbox", { name: "Описание" }), { target: { value: "Тревожное" } });
		await fireEvent.input(screen.getByRole("textbox", { name: "Краткое название источника" }), { target: { value: "DMG" } });

		await rerender({ editable: false });
		expect(screen.getByRole("button", { name: "Скопировать: Забытый храм" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Скопировать ссылку: dnd:/track/temple" })).toBeTruthy();
		expect(screen.getByText("Тревожное")).toBeTruthy();
		expect(screen.getByRole("button", { name: "DMG" })).toBeTruthy();
	});

	it("switches playback between variants and stops the previous variant", async () => {
		const onPlayingVariantChange = vi.fn();
		render(Track, {
			...names,
			normal: { fileName: "normal.mp3" }, combat: { fileName: "combat.mp3" },
			playingVariant: "normal", onPlayingVariantChange,
		});

		await fireEvent.click(screen.getByRole("button", { name: "Воспроизвести: combat.mp3" }));
		expect(onPlayingVariantChange).toHaveBeenLastCalledWith("combat");
		expect(screen.getByRole("button", { name: "Воспроизвести: normal.mp3" })).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Остановить: combat.mp3" }));
		expect(onPlayingVariantChange).toHaveBeenLastCalledWith(null);
	});

	it("routes seeking, addition and removal to the correct variant", async () => {
		const onSeek = vi.fn();
		const onAddFile = vi.fn();
		const onRemoveFile = vi.fn();
		const onPlayingVariantChange = vi.fn();
		render(Track, {
			...names, normal: { fileName: "normal.mp3", duration: 200 }, playingVariant: "normal",
			onSeek, onAddFile, onRemoveFile, onPlayingVariantChange,
		});

		await fireEvent.input(screen.getByRole("slider", { name: "Позиция воспроизведения: normal.mp3" }), { target: { value: "50" } });
		expect(onSeek).toHaveBeenCalledWith("normal", 100);
		await fireEvent.click(screen.getByRole("button", { name: "Добавить аудиофайл: Боевой" }));
		expect(onAddFile).toHaveBeenCalledWith("combat");
		await fireEvent.click(screen.getByRole("button", { name: "Удалить файл: normal.mp3" }));
		expect(onPlayingVariantChange).toHaveBeenLastCalledWith(null);
		expect(onRemoveFile).toHaveBeenCalledWith("normal");
	});
});
