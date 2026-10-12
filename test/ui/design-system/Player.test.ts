import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Player from "../../../design-system/src/lib/Player.svelte";

describe("Player", () => {
	it("shows the current track before the playlist and hides an absent next track", async () => {
		const { container, rerender } = render(Player, { trackName: "Тоннель", playlistName: "Подземье" });
		expect(Array.from(container.querySelectorAll("header span"), (element) => element.textContent)).toEqual(["Тоннель", "Подземье"]);
		expect(container.querySelector(".next-track")).toBeNull();
		expect((screen.getByRole("button", { name: "Следующий трек" }) as HTMLButtonElement).disabled).toBe(true);
		await rerender({ trackName: "Тоннель", playlistName: undefined });
		expect(container.querySelector(".playlist-name")).toBeNull();
	});

	it("toggles combat and sound independently while preserving the playback position and volume", async () => {
		const onCombatModeChange = vi.fn();
		const onMutedChange = vi.fn();
		const onVolumeChange = vi.fn();
		render(Player, { trackName: "Тоннель", playing: true, currentTime: 134, duration: 240, volume: 0.6, onCombatModeChange, onMutedChange, onVolumeChange });
		const combat = screen.getByRole("button", { name: "Боевой режим" });
		const sound = screen.getByRole("button", { name: "Звук" });
		expect(combat.getAttribute("aria-pressed")).toBe("false");
		expect(sound.getAttribute("aria-pressed")).toBe("true");
		await fireEvent.click(combat);
		expect(onCombatModeChange).toHaveBeenLastCalledWith(true);
		await fireEvent.click(combat);
		expect(onCombatModeChange).toHaveBeenLastCalledWith(false);
		await fireEvent.click(sound);
		expect(onMutedChange).toHaveBeenLastCalledWith(true);
		expect(sound.getAttribute("aria-pressed")).toBe("false");
		expect((screen.getByRole("slider", { name: "Громкость" }) as HTMLInputElement).value).toBe("60");
		await fireEvent.input(screen.getByRole("slider", { name: "Громкость" }), { target: { value: "25" } });
		expect(onVolumeChange).toHaveBeenLastCalledWith(0.25);
		await fireEvent.click(sound);
		expect(onMutedChange).toHaveBeenLastCalledWith(false);
		expect((screen.getByRole("slider", { name: "Громкость" }) as HTMLInputElement).value).toBe("25");
		expect(screen.getByRole("button", { name: "Пауза" })).toBeTruthy();
		expect(screen.getByText("02:14")).toBeTruthy();
	});

	it("switches Play/Pause, seeks in seconds and resets playback on stop", async () => {
		const onPlayingChange = vi.fn();
		const onSeek = vi.fn();
		const onStop = vi.fn();
		render(Player, { trackName: "Тоннель", duration: 240, onPlayingChange, onSeek, onStop });
		await fireEvent.click(screen.getByRole("button", { name: "Воспроизвести" }));
		expect(onPlayingChange).toHaveBeenLastCalledWith(true);
		await fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
		expect(onPlayingChange).toHaveBeenLastCalledWith(false);
		await fireEvent.input(screen.getByRole("slider", { name: "Позиция воспроизведения" }), { target: { value: "50" } });
		expect(onSeek).toHaveBeenLastCalledWith(120);
		expect(screen.getByText("02:00")).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Воспроизвести" }));
		await fireEvent.click(screen.getByRole("button", { name: "Остановить" }));
		expect(onStop).toHaveBeenCalledOnce();
		expect(screen.getByRole("button", { name: "Воспроизвести" })).toBeTruthy();
		expect(screen.getByText("00:00")).toBeTruthy();
	});

	it("routes track navigation and disables controls when requested", async () => {
		const onPrevious = vi.fn();
		const onNext = vi.fn();
		const props = { trackName: "Тоннель", nextTrackName: "Пещера", duration: 240, onPrevious, onNext };
		const { rerender } = render(Player, props);
		expect(screen.getByText("Пещера")).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Предыдущий трек" }));
		await fireEvent.click(screen.getByRole("button", { name: "Следующий трек" }));
		expect(onPrevious).toHaveBeenCalledOnce();
		expect(onNext).toHaveBeenCalledOnce();
		await rerender({ ...props, disabled: true });
		for (const control of [...screen.getAllByRole("button"), ...screen.getAllByRole("slider")]) {
			expect((control as HTMLButtonElement | HTMLInputElement).disabled).toBe(true);
		}
	});
});
