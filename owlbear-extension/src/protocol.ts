import type { ConnectionState } from "./popoverUi";
import type { OwlbearSyncDiagnostics } from "./types";

export const PROTOCOL_VERSION = 2;
export const AUTH_ERROR_CLOSE_CODE = 4001;
export const PROTOCOL_ERROR_CLOSE_CODE = 4002;
export const PAIRING_KEY = "dnd-dm-tools.owlbear.pairing";
export const MANUAL_DISCONNECT_KEY = "dnd-dm-tools.owlbear.manual-disconnect";
export const RUNTIME_CHANNEL_NAME = "dnd-dm-tools.owlbear.runtime";

export type RuntimeState = {
	connectionState: ConnectionState;
	diagnostics: OwlbearSyncDiagnostics;
	lastError?: string;
	actionPending: boolean;
	snapshotAvailable: boolean;
};

export type RuntimeMessage =
	| { type: "ui.request" }
	| { type: "ui.command"; command: "connect" | "disconnect" | "reconnect"; pairingCode?: string }
	| { type: "runtime.state"; state: RuntimeState };

export type IntegrationMessage = {
	protocolVersion: number;
	messageId: string;
	type: string;
	snapshotId?: string;
	[key: string]: unknown;
};
