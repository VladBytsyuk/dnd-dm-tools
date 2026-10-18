import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Subtrack from "../../../design-system/src/lib/Subtrack.svelte";

describe("Subtrack", () => {
	it("toggles playback and reports the requested state", async () => {
		const onPlayingChange = vi.fn();
		render(Subtrack, { fileName: "tunnel.mp3", onPlayingChange });

		await fireEvent.click(screen.getByRole("button", { name: "Воспроизвести: tunnel.mp3" }));
		expect(onPlayingChange).toHaveBeenLastCalledWith(true);
		await fireEvent.click(screen.getByRole("button", { name: "Остановить: tunnel.mp3" }));
		expect(onPlayingChange).toHaveBeenLastCalledWith(false);
	});

	it("converts a seek percentage to seconds and updates the displayed time", async () => {
		const onSeek = vi.fn();
		render(Subtrack, { fileName: "tunnel.mp3", currentTime: 134, duration: 240, onSeek });
		expect(screen.getByText("02:14 / 04:00")).toBeTruthy();

		await fireEvent.input(screen.getByRole("slider"), { target: { value: "50" } });
		expect(onSeek).toHaveBeenCalledWith(120);
		expect(screen.getByText("02:00 / 04:00")).toBeTruthy();
	});

	it("offers adding an empty variant and removing its assigned file", async () => {
		const onAdd = vi.fn();
		const onRemove = vi.fn();
		const { rerender } = render(Subtrack, { title: "Боевой", onAdd, onRemove });
		expect(screen.queryByRole("slider")).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить аудиофайл: Боевой" }));
		expect(onAdd).toHaveBeenCalledOnce();

		await rerender({ title: "Боевой", fileName: "battle.mp3", onAdd, onRemove });
		expect(screen.queryByRole("button", { name: "Добавить аудиофайл: Боевой" })).toBeNull();
		expect((screen.getByRole("slider") as HTMLInputElement).disabled).toBe(true);
		await fireEvent.click(screen.getByRole("button", { name: "Удалить файл: battle.mp3" }));
		expect(onRemove).toHaveBeenCalledOnce();
	});
});
