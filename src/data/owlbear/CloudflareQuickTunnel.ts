import { spawn, type ChildProcess } from "child_process";
import { mkdir, writeFile } from "fs/promises";
import { get } from "https";
import { join } from "path";

const PUBLIC_URL_PATTERN = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/gi;
const HEALTH_TIMEOUT_MS = 30_000;
const MAX_RETRY_DELAY_MS = 30_000;

export type OwlbearTunnelStatus = {
	state: "stopped" | "starting" | "ready" | "retrying" | "error";
	publicHost?: string;
	error?: string;
	retryInMs?: number;
};

export class CloudflareQuickTunnel {
	private child: ChildProcess | null = null;
	private retryTimer: ReturnType<typeof setTimeout> | null = null;
	private desiredRunning = false;
	private attempt = 0;
	private generation = 0;
	private diagnostic = "";
	private status: OwlbearTunnelStatus = { state: "stopped" };

	constructor(
		private readonly binaryPath: string,
		private readonly assetPort: number,
		private readonly configDirectory: string,
		private readonly publicAssetPath: string,
		private readonly onReady: (origin: string) => Promise<void> | void,
		private readonly onUnavailable: () => void,
		private readonly onStatus: (status: OwlbearTunnelStatus) => void,
	) {}

	getStatus(): OwlbearTunnelStatus { return this.status; }

	start(): void {
		if (this.desiredRunning) return;
		this.desiredRunning = true;
		this.attempt = 0;
		void this.launch(false);
	}

	async restart(): Promise<void> {
		this.desiredRunning = true;
		this.attempt = 0;
		this.clearRetry();
		this.generation += 1;
		this.onUnavailable();
		await this.stopChild();
		await this.launch(false);
	}

	async stop(): Promise<void> {
		this.desiredRunning = false;
		this.generation += 1;
		this.clearRetry();
		this.onUnavailable();
		await this.stopChild();
		this.setStatus({ state: "stopped" });
	}

	private async launch(retrying: boolean): Promise<void> {
		if (!this.desiredRunning || this.child) return;
		const generation = ++this.generation;
		this.diagnostic = "";
		this.setStatus({ state: retrying ? "retrying" : "starting" });
		try {
			await mkdir(this.configDirectory, { recursive: true });
			const configPath = join(this.configDirectory, "quick-tunnel.yml");
			await writeFile(configPath, "{}\n", "utf8");
			if (!this.desiredRunning || generation !== this.generation) return;
			const child = spawn(this.binaryPath, buildQuickTunnelArguments(configPath, this.assetPort), { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
			this.child = child;
			let candidate: string | null = null;
			const handleOutput = (chunk: Buffer) => {
				const text = chunk.toString("utf8");
				this.diagnostic = (this.diagnostic + text).slice(-2_000);
				if (candidate) return;
				candidate = findQuickTunnelOrigin(this.diagnostic);
				if (candidate) void this.acceptCandidate(candidate, child, generation);
			};
			child.stdout!.on("data", handleOutput);
			child.stderr!.on("data", handleOutput);
			child.once("error", (error) => this.handleExit(child, generation, error.message));
			child.once("exit", (code, signal) => this.handleExit(child, generation, `cloudflared завершился (${signal ?? code ?? "неизвестно"}).`));
		} catch (error) {
			this.handleLaunchFailure(generation, formatError(error));
		}
	}

	private async acceptCandidate(origin: string, child: ChildProcess, generation: number): Promise<void> {
		try {
			await waitForHealth(`${origin}${this.publicAssetPath}/health`, HEALTH_TIMEOUT_MS, () => this.desiredRunning && this.child === child && this.generation === generation);
			if (!this.desiredRunning || this.child !== child || this.generation !== generation) return;
			this.attempt = 0;
			await this.onReady(origin);
			this.setStatus({ state: "ready", publicHost: origin });
		} catch (error) {
			if (this.child !== child || generation !== this.generation) return;
			this.diagnostic = `${this.diagnostic}\n${formatError(error)}`.trim();
			child.kill("SIGTERM");
		}
	}

	private handleExit(child: ChildProcess, generation: number, reason: string): void {
		if (this.child !== child) return;
		this.child = null;
		this.onUnavailable();
		if (!this.desiredRunning || generation !== this.generation) return;
		this.scheduleRetry(this.diagnostic.trim() || reason);
	}

	private handleLaunchFailure(generation: number, reason: string): void {
		this.onUnavailable();
		if (!this.desiredRunning || generation !== this.generation) return;
		this.scheduleRetry(reason);
	}

	private scheduleRetry(error: string): void {
		this.clearRetry();
		const delay = Math.min(1_000 * (2 ** this.attempt), MAX_RETRY_DELAY_MS);
		this.attempt += 1;
		this.setStatus({ state: "retrying", error, retryInMs: delay });
		this.retryTimer = setTimeout(() => {
			this.retryTimer = null;
			void this.launch(true);
		}, delay);
	}

	private async stopChild(): Promise<void> {
		const child = this.child;
		this.child = null;
		if (!child || child.exitCode !== null || child.signalCode !== null) return;
		child.kill("SIGTERM");
		await new Promise<void>((resolve) => {
			const timeout = setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 3_000);
			child.once("exit", () => { clearTimeout(timeout); resolve(); });
		});
	}

	private clearRetry(): void {
		if (this.retryTimer) clearTimeout(this.retryTimer);
		this.retryTimer = null;
	}

	private setStatus(status: OwlbearTunnelStatus): void {
		this.status = status;
		this.onStatus(status);
	}
}

async function waitForHealth(url: string, timeoutMs: number, shouldContinue: () => boolean): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	let lastError = "Публичный health endpoint недоступен.";
	while (Date.now() < deadline && shouldContinue()) {
		try {
			if (await healthRequest(url)) return;
		} catch (error) { lastError = formatError(error); }
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error(lastError);
}

function healthRequest(url: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const request = get(url, { headers: { "User-Agent": "dnd-dm-tools-tunnel-health" } }, (response) => {
			response.resume();
			resolve(response.statusCode === 200);
		});
		request.setTimeout(5_000, () => request.destroy(new Error("Проверка туннеля превысила 5 секунд.")));
		request.once("error", reject);
	});
}

function formatError(error: unknown): string { return error instanceof Error ? error.message : String(error); }

export function buildQuickTunnelArguments(configPath: string, assetPort: number): string[] {
	return ["tunnel", "--config", configPath, "--url", `http://127.0.0.1:${assetPort}`, "--no-autoupdate", "--output", "json"];
}

export function findQuickTunnelOrigin(output: string): string | null {
	return output.match(PUBLIC_URL_PATTERN)?.[0]?.replace(/\/$/, "") ?? null;
}
