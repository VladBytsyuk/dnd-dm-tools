import type {
	FullItemMapper,
	FullItemReadService,
	HtmlReadService,
	ImportService,
	ItemReadStore,
	ItemWriteStore,
	SeedMapper,
	SeedReadService,
	ServiceResult,
	SmallItemProjector,
	TransactionalStore,
} from "src/data/ports";
import type { PageRequest, PageResult } from "src/domain/repositories/Repository";
import type { BaseItem } from "src/domain/models/common/BaseItem";

export interface TestDoubleCall {
	target: string;
	method: string;
	args: unknown[];
}

export type TestDoubleCallLog = TestDoubleCall[];

type FailureReason = Extract<ServiceResult<unknown>, { ok: false }>["reason"];

function failure<T>(reason: FailureReason, error?: unknown): ServiceResult<T> {
	return error === undefined ? { ok: false, reason } : { ok: false, reason, error };
}

abstract class ResultDouble<TResult> {
	readonly calls: TestDoubleCall[] = [];
	private readonly queuedResults: ServiceResult<TResult>[] = [];
	private defaultResult: ServiceResult<TResult> = failure("not-found");

	constructor(
		private readonly target: string,
		private readonly sharedCallLog?: TestDoubleCallLog,
	) {}

	succeed(value: TResult): this {
		this.defaultResult = { ok: true, value };
		return this;
	}

	fail(reason: FailureReason, error?: unknown): this {
		this.defaultResult = failure(reason, error);
		return this;
	}

	queueResult(result: ServiceResult<TResult>): this {
		this.queuedResults.push(result);
		return this;
	}

	protected record(method: string, args: unknown[]): void {
		const call = { target: this.target, method, args };
		this.calls.push(call);
		this.sharedCallLog?.push(call);
	}

	protected nextResult(): ServiceResult<TResult> {
		return this.queuedResults.shift() ?? this.defaultResult;
	}
}

export class FullItemReadServiceDouble<TResponse, TOptions = unknown>
	extends ResultDouble<TResponse>
	implements FullItemReadService<TResponse, TOptions>
{
	constructor(sharedCallLog?: TestDoubleCallLog) {
		super("fullItemReadService", sharedCallLog);
	}

	async getFullItem(url: string, options?: TOptions): Promise<ServiceResult<TResponse>> {
		this.record("getFullItem", [url, options]);
		return this.nextResult();
	}
}

export class HtmlReadServiceDouble extends ResultDouble<string> implements HtmlReadService {
	constructor(sharedCallLog?: TestDoubleCallLog) {
		super("htmlReadService", sharedCallLog);
	}

	async getHtml(url: string): Promise<ServiceResult<string>> {
		this.record("getHtml", [url]);
		return this.nextResult();
	}
}

export class SeedReadServiceDouble<TSeed>
	extends ResultDouble<TSeed[]>
	implements SeedReadService<TSeed>
{
	constructor(sharedCallLog?: TestDoubleCallLog) {
		super("seedReadService", sharedCallLog);
	}

	async readSeeds(): Promise<ServiceResult<TSeed[]>> {
		this.record("readSeeds", []);
		return this.nextResult();
	}
}

export class ImportServiceDouble<TInput, TImported>
	extends ResultDouble<TImported>
	implements ImportService<TInput, TImported>
{
	constructor(sharedCallLog?: TestDoubleCallLog) {
		super("importService", sharedCallLog);
	}

	async import(input: TInput): Promise<ServiceResult<TImported>> {
		this.record("import", [input]);
		return this.nextResult();
	}
}

export class FullItemMapperDouble<TResponse, TFull>
	implements FullItemMapper<TResponse, TFull>
{
	readonly calls: TestDoubleCall[] = [];

	constructor(
		private implementation: (response: TResponse, url: string) => TFull,
		private readonly sharedCallLog?: TestDoubleCallLog,
	) {}

	setImplementation(implementation: (response: TResponse, url: string) => TFull): this {
		this.implementation = implementation;
		return this;
	}

	map(response: TResponse, url: string): TFull {
		this.record("map", [response, url]);
		return this.implementation(response, url);
	}

	private record(method: string, args: unknown[]): void {
		const call = { target: "fullItemMapper", method, args };
		this.calls.push(call);
		this.sharedCallLog?.push(call);
	}
}

export class SmallItemProjectorDouble<TFull, TSmall>
	implements SmallItemProjector<TFull, TSmall>
{
	readonly calls: TestDoubleCall[] = [];

	constructor(
		private implementation: (fullItem: TFull) => TSmall,
		private readonly sharedCallLog?: TestDoubleCallLog,
	) {}

	setImplementation(implementation: (fullItem: TFull) => TSmall): this {
		this.implementation = implementation;
		return this;
	}

	project(fullItem: TFull): TSmall {
		this.record("project", [fullItem]);
		return this.implementation(fullItem);
	}

	private record(method: string, args: unknown[]): void {
		const call = { target: "smallItemProjector", method, args };
		this.calls.push(call);
		this.sharedCallLog?.push(call);
	}
}

export class SeedMapperDouble<TSeed, TSmall> implements SeedMapper<TSeed, TSmall> {
	readonly calls: TestDoubleCall[] = [];

	constructor(
		private implementation: (seed: TSeed) => TSmall,
		private readonly sharedCallLog?: TestDoubleCallLog,
	) {}

	setImplementation(implementation: (seed: TSeed) => TSmall): this {
		this.implementation = implementation;
		return this;
	}

	mapSeed(seed: TSeed): TSmall {
		this.record("mapSeed", [seed]);
		return this.implementation(seed);
	}

	private record(method: string, args: unknown[]): void {
		const call = { target: "seedMapper", method, args };
		this.calls.push(call);
		this.sharedCallLog?.push(call);
	}
}

export class ItemReadStoreDouble<
	TSmall extends BaseItem,
	TFull extends TSmall,
	TFilter,
> implements ItemReadStore<TSmall, TFull, TFilter> {
	readonly calls: TestDoubleCall[] = [];
	allSmallItems: TSmall[] = [];
	filteredSmallItems: TSmall[] = [];
	smallItemsPage: PageResult<TSmall> = { items: [], hasMore: false };
	smallItemNames: string[] = [];
	smallItemsByName = new Map<string, TSmall | null>();
	fullItemsByName = new Map<string, TFull | null>();
	fullItemsByUrl = new Map<string, TFull | null>();

	constructor(private readonly sharedCallLog?: TestDoubleCallLog) {}

	async readAllSmallItems(): Promise<TSmall[]> {
		this.record("readAllSmallItems", []);
		return [...this.allSmallItems];
	}

	async readFilteredSmallItems(name: string | null, filter: TFilter | null): Promise<TSmall[]> {
		this.record("readFilteredSmallItems", [name, filter]);
		return [...this.filteredSmallItems];
	}

	async readSmallItemsPage(
		filter: TFilter | null,
		request: PageRequest,
	): Promise<PageResult<TSmall>> {
		this.record("readSmallItemsPage", [filter, request]);
		return {
			items: [...this.smallItemsPage.items],
			hasMore: this.smallItemsPage.hasMore,
		};
	}

	async readAllSmallItemNames(): Promise<string[]> {
		this.record("readAllSmallItemNames", []);
		return [...this.smallItemNames];
	}

	async readSmallItemByName(name: string): Promise<TSmall | null> {
		this.record("readSmallItemByName", [name]);
		return this.smallItemsByName.get(name) ?? null;
	}

	async readFullItemByName(name: string): Promise<TFull | null> {
		this.record("readFullItemByName", [name]);
		return this.fullItemsByName.get(name) ?? null;
	}

	async readFullItemByUrl(url: string): Promise<TFull | null> {
		this.record("readFullItemByUrl", [url]);
		return this.fullItemsByUrl.get(url) ?? null;
	}

	private record(method: string, args: unknown[]): void {
		const call = { target: "itemReadStore", method, args };
		this.calls.push(call);
		this.sharedCallLog?.push(call);
	}
}

export class ItemWriteStoreDouble<TSmall extends BaseItem, TFull extends TSmall>
	implements ItemWriteStore<TSmall, TFull>
{
	readonly calls: TestDoubleCall[] = [];
	private nextError: unknown;

	constructor(private readonly sharedCallLog?: TestDoubleCallLog) {}

	throwNext(error: unknown): this {
		this.nextError = error;
		return this;
	}

	async saveFetchedFull(fullItem: TFull): Promise<void> {
		this.record("saveFetchedFull", [fullItem]);
		this.throwIfNeeded();
	}

	async upsertUserItem(smallItem: TSmall, fullItem: TFull): Promise<void> {
		this.record("upsertUserItem", [smallItem, fullItem]);
		this.throwIfNeeded();
	}

	async deleteByUrl(url: string): Promise<void> {
		this.record("deleteByUrl", [url]);
		this.throwIfNeeded();
	}

	private throwIfNeeded(): void {
		if (this.nextError === undefined) return;
		const error = this.nextError;
		this.nextError = undefined;
		throw error;
	}

	private record(method: string, args: unknown[]): void {
		const call = { target: "itemWriteStore", method, args };
		this.calls.push(call);
		this.sharedCallLog?.push(call);
	}
}

export class TransactionalStoreSpy implements TransactionalStore {
	readonly calls: TestDoubleCall[] = [];

	constructor(private readonly sharedCallLog?: TestDoubleCallLog) {}

	async transaction<T>(callback: () => Promise<T>): Promise<T> {
		this.record("begin", []);
		try {
			const result = await callback();
			this.record("commit", []);
			return result;
		} catch (error) {
			this.record("rollback", [error]);
			throw error;
		}
	}

	private record(method: string, args: unknown[]): void {
		const call = { target: "transactionalStore", method, args };
		this.calls.push(call);
		this.sharedCallLog?.push(call);
	}
}
