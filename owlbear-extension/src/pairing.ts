export type OwlbearPairing = {
	version: 1 | 2;
	websocketUrl: string;
	token: string;
};

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,}$/;
const QUICK_TUNNEL_HOST_PATTERN = /^[a-z0-9-]+\.trycloudflare\.com$/i;

export function parsePairingCode(value: string): OwlbearPairing | null {
	const publicMatch = /^dnd-dm-tools:v2:([^:]+):([A-Za-z0-9_-]{32}):([A-Za-z0-9_-]{32,})$/.exec(value);
	if (publicMatch) {
		const [, host, pathSecret, token] = publicMatch;
		if (!QUICK_TUNNEL_HOST_PATTERN.test(host) || !TOKEN_PATTERN.test(token)) return null;
		return {
			version: 2,
			websocketUrl: `wss://${host.toLowerCase()}/assets/${pathSecret}/ws`,
			token,
		};
	}

	const localMatch = /^dnd-dm-tools:v1:(\d{4,5}):([A-Za-z0-9_-]{32,})$/.exec(value);
	if (!localMatch) return null;
	const port = Number(localMatch[1]);
	if (port < 1024 || port > 65535 || !TOKEN_PATTERN.test(localMatch[2])) return null;
	return {
		version: 1,
		websocketUrl: `ws://localhost:${port}/ws`,
		token: localMatch[2],
	};
}
