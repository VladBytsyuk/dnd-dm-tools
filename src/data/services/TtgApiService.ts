import { requestUrl } from "obsidian";
import type { ServiceResult } from "src/data/ports";

export type TtgJsonObject = Record<string, unknown>;

export interface TtgApiRequestOptions {
	requestBody?: object;
	sourceBooks?: string[];
	requestedUrl?: string;
}

interface RequestUrlResponseLike {
	status: number;
	json?: unknown;
}

type RequestResult = {
	ok: true;
	response: RequestUrlResponseLike;
} | {
	ok: false;
	status?: number;
	error: unknown;
};

interface TtgEndpoint {
	resource: string;
	slug: string;
	legacy: boolean;
	legacyUrl: string;
}

function statusFailure<T>(status: number): ServiceResult<T> {
	const error = new Error(`HTTP error ${status}.`);
	return {
		ok: false,
		reason: status === 404 ? "not-found" : "invalid-response",
		error,
	};
}

function buildRequestBody(options?: TtgApiRequestOptions): object | undefined {
	if (options?.requestBody) return options.requestBody;
	if (options?.sourceBooks) {
		return {
			filter: {
				book: options.sourceBooks,
			},
		};
	}
	return undefined;
}

function trimSlashes(value: string): string {
	return value.replace(/^\/+|\/+$/g, "");
}

function lastSegment(value: string): string {
	const segments = trimSlashes(value).split("/").filter(Boolean);
	return segments[segments.length - 1] ?? "";
}

function endpointFromUrl(url: string): TtgEndpoint {
	const normalized = trimSlashes(url);
	const parts = normalized.split("/").filter(Boolean);
	const [prefix, second] = parts;
	const slug = lastSegment(normalized);

	if (prefix === "screens") {
		return { resource: "screens", slug, legacy: true, legacyUrl: normalized };
	}
	if (prefix === "races") {
		return { resource: "species", slug, legacy: false, legacyUrl: normalized };
	}
	if (prefix === "items" && second === "magic") {
		return { resource: "magic-items", slug, legacy: false, legacyUrl: normalized };
	}
	if (prefix === "items" || prefix === "equipment" || prefix === "weapons" || prefix === "armor" || prefix === "armors") {
		return { resource: "item", slug, legacy: false, legacyUrl: normalized };
	}

	return {
		resource: prefix || normalized,
		slug,
		legacy: false,
		legacyUrl: normalized,
	};
}

function buildV2Url(endpoint: TtgEndpoint, slug = endpoint.slug): string {
	return `https://new.ttg.club/api/v2/${endpoint.resource}/${encodeURIComponent(slug)}`;
}

function buildSearchUrl(endpoint: TtgEndpoint, query: string): string {
	return `https://new.ttg.club/api/v2/${endpoint.resource}/search?q=${encodeURIComponent(query)}`;
}

function buildLegacyUrl(url: string): string {
	return `https://ttg.club/api/v1/${trimSlashes(url)}`;
}

async function readJson(response: RequestUrlResponseLike): Promise<TtgJsonObject | null> {
	const jsonValue = typeof response.json === "function"
		? await (response.json as () => unknown | Promise<unknown>)()
		: await response.json;

	if (!jsonValue || typeof jsonValue !== "object" || Array.isArray(jsonValue)) {
		return null;
	}
	return jsonValue as TtgJsonObject;
}

export class TtgApiService {
	async getJson(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		const endpoint = endpointFromUrl(url);
		return endpoint.legacy
			? await this.requestLegacyJson(endpoint.legacyUrl, options)
			: await this.requestV2Json(endpoint, options);
	}

	async postJson(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		return await this.getJson(url, options);
	}

	private async requestLegacyJson(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		try {
			const body = buildRequestBody(options);
			const result = await requestJsonUrl({
				url: buildLegacyUrl(url),
				method: "POST",
				body: body ? JSON.stringify(body) : undefined,
				contentType: body ? "application/json" : undefined,
			});
			if (!result.ok) {
				return result.status ? statusFailure(result.status) : { ok: false, reason: "network", error: result.error };
			}

			return await this.readObjectResponse(result.response);
		} catch (error) {
			return { ok: false, reason: "network", error };
		}
	}

	private async requestV2Json(
		endpoint: TtgEndpoint,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		try {
			const directResult = await requestJsonUrl({
				url: buildV2Url(endpoint),
				method: "GET",
			});
			if (!directResult.ok) {
				if (directResult.status === 404) {
					return await this.requestResolvedOrLegacyJson(endpoint, options);
				}
				return await this.requestLegacyJson(endpoint.legacyUrl, options);
			}

			if (directResult.response.status === 404) {
				return await this.requestResolvedOrLegacyJson(endpoint, options);
			}

			const result = await this.readObjectResponse(directResult.response);
			return result.ok ? result : await this.requestLegacyJson(endpoint.legacyUrl, options);
		} catch (error) {
			return { ok: false, reason: "network", error };
		}
	}

	private async requestResolvedOrLegacyJson(
		endpoint: TtgEndpoint,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		const resolvedSlug = await this.resolveSlug(endpoint, options);
		if (!resolvedSlug || resolvedSlug === endpoint.slug) {
			return await this.requestLegacyJson(endpoint.legacyUrl, options);
		}

		const retryResult = await requestJsonUrl({
			url: buildV2Url(endpoint, resolvedSlug),
			method: "GET",
		});
		if (!retryResult.ok) {
			return await this.requestLegacyJson(endpoint.legacyUrl, options);
		}

		const retryReadResult = await this.readObjectResponse(retryResult.response);
		return retryReadResult.ok ? retryReadResult : await this.requestLegacyJson(endpoint.legacyUrl, options);
	}

	private async resolveSlug(
		endpoint: TtgEndpoint,
		options?: TtgApiRequestOptions,
	): Promise<string | null> {
		const responseResult = await requestJsonUrl({
			url: buildSearchUrl(endpoint, endpoint.slug),
			method: "GET",
		});
		if (!responseResult.ok) return null;
		const response = responseResult.response;
		if (response.status !== 200) return null;

		let jsonValue: unknown;
		try {
			jsonValue = typeof response.json === "function"
				? await (response.json as () => unknown | Promise<unknown>)()
				: await response.json;
		} catch {
			return null;
		}
		if (!Array.isArray(jsonValue)) return null;

		const requestedUrl = options?.requestedUrl ?? endpoint.legacyUrl;
		const sourceBooks = new Set(options?.sourceBooks ?? []);
		const candidates = jsonValue.filter((item): item is TtgJsonObject =>
			item !== null && typeof item === "object" && !Array.isArray(item)
		);
		const compatible = candidates.filter((item) =>
			isCompatibleEdition(item) && matchesSourceBooks(item, sourceBooks)
		);
		const match = compatible.find((item) => matchesUrlOrName(item, requestedUrl, endpoint.slug))
			?? compatible[0]
			?? candidates.find(isCompatibleEdition)
			?? null;

		const matchUrl = typeof match?.url === "string" ? match.url : null;
		return matchUrl ? lastSegment(matchUrl) : null;
	}

	private async readObjectResponse(response: RequestUrlResponseLike): Promise<ServiceResult<TtgJsonObject>> {
		if (response.status !== 200) {
			return statusFailure(response.status);
		}

		let value: TtgJsonObject | null;
		try {
			value = await readJson(response);
		} catch (error) {
			return { ok: false, reason: "invalid-response", error };
		}
		if (!value) {
			return { ok: false, reason: "invalid-response" };
		}

		return { ok: true, value };
	}
}

function isCompatibleEdition(item: TtgJsonObject): boolean {
	const srdVersion = item.srdVersion;
	return typeof srdVersion !== "string" || !srdVersion.includes("2024");
}

function matchesSourceBooks(item: TtgJsonObject, sourceBooks: Set<string>): boolean {
	if (sourceBooks.size === 0) return true;
	const source = item.source;
	if (!source || typeof source !== "object" || Array.isArray(source)) return true;
	const sourceRecord = source as TtgJsonObject;
	return sourceTokens(sourceRecord).some((token) => sourceBooks.has(token));
}

function matchesUrlOrName(item: TtgJsonObject, requestedUrl: string, slug: string): boolean {
	if (typeof item.url === "string" && (trimSlashes(item.url) === trimSlashes(requestedUrl) || lastSegment(item.url) === slug)) {
		return true;
	}
	const name = item.name;
	if (!name || typeof name !== "object" || Array.isArray(name)) return false;
	const nameRecord = name as TtgJsonObject;
	const normalizedSlug = slug.toLocaleLowerCase("ru-RU").replace(/[_-]/g, " ");
	return [nameRecord.eng, nameRecord.rus]
		.filter((value): value is string => typeof value === "string")
		.some((value) => value.toLocaleLowerCase("ru-RU") === normalizedSlug);
}

function sourceTokens(source: TtgJsonObject): string[] {
	const tokens: string[] = [];
	for (const key of ["shortName", "label", "name"]) {
		const value = source[key];
		if (typeof value === "string") tokens.push(value);
		if (value && typeof value === "object" && !Array.isArray(value)) {
			const record = value as TtgJsonObject;
			for (const nestedKey of ["label", "eng", "rus"]) {
				const nestedValue = record[nestedKey];
				if (typeof nestedValue === "string") tokens.push(nestedValue);
			}
		}
	}
	return tokens;
}

async function requestJsonUrl(options: {
	url: string;
	method: string;
	body?: string;
	contentType?: string;
}): Promise<RequestResult> {
	try {
		const response = await requestUrl(options) as RequestUrlResponseLike;
		return { ok: true, response };
	} catch (error) {
		return { ok: false, status: statusFromRequestError(error), error };
	}
}

function statusFromRequestError(error: unknown): number | undefined {
	if (error && typeof error === "object" && "status" in error) {
		const status = (error as { status?: unknown }).status;
		if (typeof status === "number") return status;
	}

	const message = error instanceof Error ? error.message : String(error);
	const match = message.match(/status\s+(\d{3})/i);
	return match ? Number(match[1]) : undefined;
}
