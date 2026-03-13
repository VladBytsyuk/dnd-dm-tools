import { afterEach, describe, expect, it, vi } from "vitest";
import { pickJsonFileText } from "../../../../src/ui/layout/character/characterSheetFilePicker";

describe("characterSheetFilePicker", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should resolve null when no file is selected", async () => {
		const clickMock = vi.fn(function (this: HTMLInputElement) {
			this.onchange?.({ target: { files: [] } } as unknown as Event);
		});
		const createElementSpy = vi.spyOn(document, "createElement");
		createElementSpy.mockImplementation(((tagName: string) => {
			const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName) as HTMLInputElement;
			element.click = clickMock;
			return element;
		}) as typeof document.createElement);

		await expect(pickJsonFileText()).resolves.toBeNull();
		expect(clickMock).toHaveBeenCalled();
	});

	it("should resolve selected file text", async () => {
		const file = { text: vi.fn().mockResolvedValue("{\"jsonType\":\"character\"}") };
		const clickMock = vi.fn(function (this: HTMLInputElement) {
			this.onchange?.({ target: { files: [file] } } as unknown as Event);
		});
		const createElementSpy = vi.spyOn(document, "createElement");
		createElementSpy.mockImplementation(((tagName: string) => {
			const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName) as HTMLInputElement;
			element.click = clickMock;
			return element;
		}) as typeof document.createElement);

		await expect(pickJsonFileText()).resolves.toBe("{\"jsonType\":\"character\"}");
		expect(file.text).toHaveBeenCalled();
	});
});
