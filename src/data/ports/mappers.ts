export interface FullItemMapper<TResponse, TFull> {
	map(response: TResponse, url: string): TFull;
}

export interface SmallItemProjector<TFull, TSmall> {
	project(fullItem: TFull): TSmall;
}

export interface SeedMapper<TSeed, TSmall> {
	mapSeed(seed: TSeed): TSmall;
}
