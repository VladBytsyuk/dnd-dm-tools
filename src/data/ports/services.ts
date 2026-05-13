import type { ServiceResult } from "./ServiceResult";

export interface FullItemReadService<TResponse, TOptions = unknown> {
	getFullItem(url: string, options?: TOptions): Promise<ServiceResult<TResponse>>;
}

export interface HtmlReadService {
	getHtml(url: string): Promise<ServiceResult<string>>;
}

export interface SeedReadService<TSeed> {
	readSeeds(): Promise<ServiceResult<TSeed[]>>;
}

export interface ImportService<TInput, TImported> {
	import(input: TInput): Promise<ServiceResult<TImported>>;
}
