import { requestUrl } from "obsidian";
import type { ServiceResult } from "src/data/ports";

export type TtgJsonObject = Record<string, unknown>;

export interface TtgApiRequestOptions {
	requestBody?: object;
	sourceBooks?: string[];
}

interface RequestUrlResponseLike {
	status: number;
	json?: unknown;
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
	async postJson(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		try {
			const body = buildRequestBody(options);
			const response = await requestUrl({
				url: `https://ttg.club/api/v1/${url}`,
				method: "POST",
				body: body ? JSON.stringify(body) : undefined,
				contentType: body ? "application/json" : undefined,
			}) as RequestUrlResponseLike;

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
		} catch (error) {
			return { ok: false, reason: "network", error };
		}
	}
}
