import { render } from "@testing-library/svelte";
import Sword from "lucide-svelte/icons/sword";
import { describe, expect, it } from "vitest";
import BaseSmallItem from "../../../design-system/src/lib/BaseSmallItem.svelte";
import Chip from "../../../design-system/src/lib/Chip.svelte";
import Playlist from "../../../design-system/src/lib/Playlist.svelte";
import ReferencePicker from "../../../design-system/src/lib/ReferencePicker.svelte";
import Subtrack from "../../../design-system/src/lib/Subtrack.svelte";
import Track from "../../../design-system/src/lib/Track.svelte";

// SVG attributes need numeric fallbacks in Obsidian versions that cannot resolve
// CSS variables in SVG presentation attributes. Scaling belongs in CSS styles.
function expectPortableIconSizes(container: HTMLElement) {
	const icons = container.querySelectorAll("svg.lucide");
	expect(icons.length).toBeGreaterThan(0);
	for (const icon of icons) {
		for (const dimension of ["width", "height"]) {
			expect(Number(icon.getAttribute(dimension))).toBeGreaterThan(0);
			expect(icon.getAttribute("style")).toContain(`${dimension}: calc(`);
		}
	}
}

describe("portable icon dimensions", () => {
	it("sizes favorite, metadata and customization icons in shared cards", () => {
		const { container } = render(BaseSmallItem, { title: "Карточка", favorite: true, icon: Sword, centerIcons: [{ icon: Sword, label: "Центр" }], bottomIcons: [{ icon: Sword, label: "Низ" }] });
		expectPortableIconSizes(container);
	});

	it.each([{}, { iconTooltip: "Подсказка" }, { toggle: true }, { toggle: true, editable: true }])("sizes chip icons with props %j", (props) => {
		const { container } = render(Chip, { text: "Чип", icon: Sword, ...props });
		expectPortableIconSizes(container);
	});

	it("sizes picker arrows and clear buttons", () => {
		const { container } = render(ReferencePicker, { label: "Заметка", value: "Сцена.md" });
		expectPortableIconSizes(container);
	});

	it.each([{}, { fileName: "Трек.mp3" }, { fileName: "Трек.mp3", playing: true }])("sizes audio controls with props %j", (props) => {
		const { container } = render(Subtrack, props);
		expectPortableIconSizes(container);
	});

	it("sizes track repeat and audio controls", () => {
		const { container } = render(Track, { russianName: "Трек", entityLink: "/track/test", editable: true });
		expectPortableIconSizes(container);
	});

	it("sizes playlist add, remove and drag controls", () => {
		const { container } = render(Playlist, { russianName: "Плейлист", entityLink: "/playlist/test", tracks: [{ id: "test", title: "Трек", hasCombat: true }], editable: true });
		expectPortableIconSizes(container);
	});
});
