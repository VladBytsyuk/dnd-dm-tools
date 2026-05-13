import type { FullItemReadService, ServiceResult } from "src/data/ports";
import { TtgApiService, type TtgApiRequestOptions, type TtgJsonObject } from "./TtgApiService";
import { TtgHtmlService } from "./TtgHtmlService";

export interface TtgItemWithHtml<TItem extends TtgJsonObject = TtgJsonObject> {
	item: TItem;
	associatedUrl: string;
	associatedHtml?: string;
}

function getStringProperty(source: TtgJsonObject, key: string): string | undefined {
	const value = source[key];
	return typeof value === "string" ? value : undefined;
}

function buildClassFragmentUrl(classUrl: string): string {
	if (classUrl.includes("/fragment/")) return classUrl;

	const parts = classUrl.replace(/^\//, "").split("/");
	if (parts.length >= 2 && parts[0] === "classes") {
		return `/${parts[0]}/fragment/${parts.slice(1).join("/")}`;
	}
	return classUrl;
}

export class TtgService implements FullItemReadService<TtgJsonObject, TtgApiRequestOptions> {
	constructor(
		private readonly apiService = new TtgApiService(),
		private readonly htmlService = new TtgHtmlService(),
	) {}

	async getFullItem(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		return await this.apiService.postJson(url, options);
	}

	async getClassWithHtml(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgItemWithHtml>> {
		const itemResult = await this.getFullItem(url, options);
		if (!itemResult.ok) return itemResult;

		const apiUrl = getStringProperty(itemResult.value, "url") ?? url;
		const associatedUrl = buildClassFragmentUrl(apiUrl);
		const htmlResult = await this.htmlService.getHtml(associatedUrl);

		return {
			ok: true,
			value: {
				item: itemResult.value,
				associatedUrl,
				associatedHtml: htmlResult.ok ? htmlResult.value : undefined,
			},
		};
	}

	async getBackgroundWithHtml(url: string): Promise<ServiceResult<TtgItemWithHtml>> {
		const itemResult = await this.getFullItem(url);
		if (!itemResult.ok) return itemResult;

		const associatedUrl = getStringProperty(itemResult.value, "url") ?? url;
		const htmlResult = await this.htmlService.getHtml(associatedUrl);

		return {
			ok: true,
			value: {
				item: itemResult.value,
				associatedUrl,
				associatedHtml: htmlResult.ok ? htmlResult.value : undefined,
			},
		};
	}

	async getDmScreenDescription(url: string): Promise<ServiceResult<TtgJsonObject>> {
		return await this.getFullItem(url);
	}

	async getRaceTree(
		url: string,
		options?: TtgApiRequestOptions,
	): Promise<ServiceResult<TtgJsonObject>> {
		return await this.getFullItem(url, options);
	}
}
