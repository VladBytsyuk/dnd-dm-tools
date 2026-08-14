export class OwlbearSyncScheduler<TSnapshot> {
	private version = 0;
	private inFlight = false;
	private timer: number | null = null;
	private disposed = false;

	constructor(
		private readonly createSnapshot: () => Promise<TSnapshot>,
		private readonly publish: (snapshot: TSnapshot) => Promise<void>,
		private readonly delayMs = 250,
	) {}

	queue(): void {
		if (this.disposed) return;
		this.version += 1;
		if (this.inFlight || this.timer !== null) return;
		this.timer = window.setTimeout(() => {
			this.timer = null;
			void this.flush();
		}, this.delayMs);
	}

	dispose(): void {
		this.disposed = true;
		if (this.timer !== null) window.clearTimeout(this.timer);
		this.timer = null;
	}

	private async flush(): Promise<void> {
		if (this.disposed) return;
		this.inFlight = true;
		let sentVersion = -1;
		try {
			do {
				sentVersion = this.version;
				const snapshot = await this.createSnapshot();
				if (this.disposed) return;
				await this.publish(snapshot);
			} while (!this.disposed && sentVersion !== this.version);
		} catch {
			// Background sync failures must not interrupt initiative editing.
		} finally {
			this.inFlight = false;
			if (!this.disposed && sentVersion !== this.version) this.queue();
		}
	}
}
