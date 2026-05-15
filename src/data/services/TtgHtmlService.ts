import { requestUrl } from "obsidian";
import type { ServiceResult } from "src/data/ports";

interface RequestUrlResponseLike {
	status: number;
	text?: unknown;
}

function statusFailure<T>(status: number): ServiceResult<T> {
	const error = new Error(`HTTP error ${status}.`);
	return {
		ok: false,
		reason: status === 404 ? "not-found" : "invalid-response",
		error,
	};
}

async function readText(response: RequestUrlResponseLike): Promise<string | null> {
	const textValue = typeof response.text === "function"
		? await (response.text as () => string | Promise<string>)()
		: await response.text;

	return typeof textValue === "string" ? textValue : null;
}

export class TtgHtmlService {
	async getHtml(url: string): Promise<ServiceResult<string>> {
		try {
			const response = await requestUrl({
				url: `https://ttg.club/${url}`,
				method: "GET",
			}) as RequestUrlResponseLike;

			if (response.status !== 200) {
				return statusFailure(response.status);
			}

			let value: string | null;
			try {
				value = await readText(response);
			} catch (error) {
				return { ok: false, reason: "invalid-response", error };
			}
			if (value === null) {
				return { ok: false, reason: "invalid-response" };
			}

			return { ok: true, value };
		} catch (error) {
			return { ok: false, reason: "network", error };
		}
	}
}
