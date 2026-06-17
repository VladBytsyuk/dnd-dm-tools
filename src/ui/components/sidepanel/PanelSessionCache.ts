import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

interface PanelSession {
	container: HTMLDivElement;
	component: unknown;
	mounting: Promise<void>;
	disposed: boolean;
}

export class PanelSessionCache {
	private sessions = new Map<PanelKey, PanelSession>();

	constructor(
		private mountComponent: (key: PanelKey, element: Element) => Promise<unknown>,
		private unmountComponent: (component: unknown) => void,
		private onDetach: (key: PanelKey) => void = () => {},
	) {}

	async attach(key: PanelKey, target: Element): Promise<() => void> {
		const session = this.sessions.get(key) ?? this.createSession(key);
		target.appendChild(session.container);
		await session.mounting;

		return () => {
			if (session.container.parentElement !== target) return;
			this.onDetach(key);
			session.container.remove();
		};
	}

	discard(key: PanelKey): void {
		const session = this.sessions.get(key);
		if (!session) return;

		this.sessions.delete(key);
		session.disposed = true;
		session.container.remove();
		if (session.component !== undefined) {
			this.unmountComponent(session.component);
			session.component = undefined;
		}
	}

	dispose(): void {
		for (const key of Array.from(this.sessions.keys())) {
			this.discard(key);
		}
	}

	private createSession(key: PanelKey): PanelSession {
		const container = document.createElement("div");
		container.className = "omni-panel-session";
		container.style.display = "flex";
		container.style.flex = "1 1 auto";
		container.style.flexDirection = "column";
		container.style.minHeight = "100%";
		container.style.overflow = "visible";
		container.style.width = "100%";

		const session: PanelSession = {
			container,
			component: undefined,
			mounting: Promise.resolve(),
			disposed: false,
		};
		session.mounting = this.mountComponent(key, container)
			.then((component) => {
				if (session.disposed) {
					if (component !== undefined) this.unmountComponent(component);
					return;
				}
				session.component = component;
			})
			.catch((error) => {
				if (this.sessions.get(key) === session) this.sessions.delete(key);
				session.container.remove();
				throw error;
			});
		this.sessions.set(key, session);
		return session;
	}
}
