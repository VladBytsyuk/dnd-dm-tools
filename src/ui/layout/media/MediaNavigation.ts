import { get, writable } from "svelte/store";
import type { MediaRoute } from "src/domain/models/media/MediaLibrary";

/** One history per panel; it survives attaching the panel to another tile. */
export class MediaNavigation {
	readonly routes = writable<MediaRoute[]>([]);
	readonly adventuresTab = writable<"adventure" | "scene">("adventure");
	beforeLeave: (() => Promise<boolean>) | undefined;
	async open(route: MediaRoute): Promise<boolean> {
		if (this.beforeLeave && !(await this.beforeLeave())) return false;
		const routes = get(this.routes);
		const current = routes.at(-1);
		if (current?.kind === route.kind && current.id === route.id && (route.kind !== "scene" || current.adventureId === route.adventureId)) return true;
		this.routes.set([...routes, route]);
		return true;
	}
	async back(): Promise<void> {
		const current = get(this.routes).at(-1);
		if (this.beforeLeave && !(await this.beforeLeave())) return;
		this.routes.update((routes) => routes.at(-1) === current ? routes.slice(0, -1) : routes);
	}
	clear(): void { this.routes.set([]); }
}
