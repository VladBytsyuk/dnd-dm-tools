const QUICK_TUNNEL_HOST_PATTERN = /^[a-z0-9-]+\.trycloudflare\.com$/i;
const PUBLIC_WEBSOCKET_PATH_PATTERN = /^\/assets\/([A-Za-z0-9_-]{32})\/ws$/;

export function createOwlbearPairingCode(websocketUrl: string, authToken: string): string {
	const url = new URL(websocketUrl);
	const pathMatch = PUBLIC_WEBSOCKET_PATH_PATTERN.exec(url.pathname);
	if (url.protocol !== "wss:"
		|| !QUICK_TUNNEL_HOST_PATTERN.test(url.hostname)
		|| url.port
		|| url.search
		|| url.hash
		|| !pathMatch
		|| !/^[A-Za-z0-9_-]{32,}$/.test(authToken)) return "";
	return `dnd-dm-tools:v2:${url.hostname.toLowerCase()}:${pathMatch[1]}:${authToken}`;
}
