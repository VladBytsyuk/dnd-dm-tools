import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ProgressBar from "../../../design-system/src/lib/ProgressBar.svelte";

describe("ProgressBar", () => {
	it("lets the user seek and reports the new position", async () => {
		const onValueChange = vi.fn();
		render(ProgressBar, { value: 65, onValueChange });
		const slider = screen.getByRole("slider", { name: "Позиция воспроизведения" }) as HTMLInputElement;

		expect(slider.value).toBe("65");
		await fireEvent.input(slider, { target: { value: "80" } });
		expect(onValueChange).toHaveBeenCalledWith(80);
		expect(slider.value).toBe("80");
	});

	it("clamps an invalid position and exposes a disabled state", () => {
		render(ProgressBar, { value: 120, disabled: true });
		const slider = screen.getByRole("slider") as HTMLInputElement;

		expect(slider.value).toBe("100");
		expect(slider.disabled).toBe(true);
	});
});
