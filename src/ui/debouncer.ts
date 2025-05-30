export class Debouncer {
    private timer: number | null = null;
    private latestValue: string = "";
  
    constructor(
        private readonly delay: number,
        private readonly callback: (value: string) => Promise<void>,
    ) {}
  
    debounce(value: string): void {
        if (this.timer !== null) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        this.latestValue = value;
        this.timer = window.setTimeout(async () => {
            try {
                await this.callback(this.latestValue);
            } catch (e) {
                console.error('Error in debouncer callback:', e);
            }
            this.timer = null;
        }, this.delay);
    }
  
    cancel(): void {
        if (this.timer !== null) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export const DEFAULT_DEBOUNCER_DELAY = 500;
