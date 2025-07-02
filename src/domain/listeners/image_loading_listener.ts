export interface IImageLoadingListener {
    onImageRequested: (imageUrl: string) => Promise<string>;
}