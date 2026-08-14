import { afterEach, describe, expect, it, vi } from "vitest";
import { OwlbearSyncScheduler } from "src/ui/layout/tracker/OwlbearSyncScheduler";

afterEach(() => {
	vi.useRealTimers();
});

describe("OwlbearSyncScheduler", () => {
	it("cancels a queued live-sync when disposed", async () => {
		vi.useFakeTimers();
		const createSnapshot = vi.fn(async () => ({ snapshotId: "snapshot-1" }));
		const publish = vi.fn(async () => {});
		const scheduler = new OwlbearSyncScheduler(createSnapshot, publish);

		scheduler.queue();
		scheduler.dispose();
		await vi.advanceTimersByTimeAsync(300);

		expect(createSnapshot).not.toHaveBeenCalled();
		expect(publish).not.toHaveBeenCalled();
	});

	it("does not publish a snapshot that finishes materializing after disposal", async () => {
		vi.useFakeTimers();
		let finishSnapshot!: (snapshot: { snapshotId: string }) => void;
		const createSnapshot = vi.fn(() => new Promise<{ snapshotId: string }>((resolve) => { finishSnapshot = resolve; }));
		const publish = vi.fn(async () => {});
		const scheduler = new OwlbearSyncScheduler(createSnapshot, publish);

		scheduler.queue();
		await vi.advanceTimersByTimeAsync(250);
		expect(createSnapshot).toHaveBeenCalledOnce();
		scheduler.dispose();
		finishSnapshot({ snapshotId: "stale" });
		await Promise.resolve();

		expect(publish).not.toHaveBeenCalled();
	});
});
