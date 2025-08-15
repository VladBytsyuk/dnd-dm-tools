export interface Initializable {
    /**
     * Initializes the object.
     * @returns A promise that resolves when the initialization is complete.
     */
    initialize(): Promise<void>;

    /**
     * Disposes of the object, cleaning up resources.
     */
    dispose(): void;
}
