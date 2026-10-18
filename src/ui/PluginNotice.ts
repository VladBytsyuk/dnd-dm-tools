import { Notice } from "obsidian";

/** Keep plugin notifications in the same typography scope as its panels. */
export class PluginNotice extends Notice {
	constructor(...args: ConstructorParameters<typeof Notice>) {
		super(...args);
		this.noticeEl.classList.add("dnd-ui");
	}
}
