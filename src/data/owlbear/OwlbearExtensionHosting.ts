export const OWLBEAR_PRODUCTION_EXTENSION_URL = "https://vladbytsyuk.github.io/dnd-dm-tools/owlbear-extension/manifest.json";
export const OWLBEAR_DEVELOPMENT_EXTENSION_URL = "http://localhost:5173/manifest.json";

const OWLBEAR_PRODUCTION_EXTENSION_ORIGIN = new URL(OWLBEAR_PRODUCTION_EXTENSION_URL).origin;
const OWLBEAR_DEVELOPMENT_EXTENSION_ORIGIN = new URL(OWLBEAR_DEVELOPMENT_EXTENSION_URL).origin;

export function getOwlbearExtensionInstallUrl(development: boolean): string {
	return development ? OWLBEAR_DEVELOPMENT_EXTENSION_URL : OWLBEAR_PRODUCTION_EXTENSION_URL;
}

export function isAllowedOwlbearExtensionOrigin(origin: string | undefined, localServerOrigin: string): boolean {
	return origin === localServerOrigin
		|| origin === OWLBEAR_DEVELOPMENT_EXTENSION_ORIGIN
		|| origin === OWLBEAR_PRODUCTION_EXTENSION_ORIGIN;
}
