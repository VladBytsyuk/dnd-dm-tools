import { emptyFilters } from "src/domain/models/common/Filters";
import type { CharacterSheetFilters } from "../../../domain/models/character/CharacterSheetFilters";
import type { FullCharacterSheet } from "../../../domain/models/character/FullCharacterSheet";
import type { SmallCharacterSheet } from "../../../domain/models/character/SmallCharacterSheet";
import type {
	CharacterSheetBrowserState,
	CharacterSheetGateway,
} from "../../../data/repositories/characterSheetTypes";

type CharacterSheetBrowserControllerOptions = {
	onStateChange?: (state: CharacterSheetBrowserState) => void;
};

const DEFAULT_FILTERS = () =>
	emptyFilters<CharacterSheetFilters>(["classes", "levels", "races"]);

export class CharacterSheetBrowserController {
	private state: CharacterSheetBrowserState = {
		searchBarValue: "",
		filters: DEFAULT_FILTERS(),
		itemsStack: [],
		currentItem: undefined,
		groups: [],
		isFiltersOverlayOpen: false,
		fullFilters: null,
		status: "idle",
		errorMessage: null,
	};

	constructor(
		private readonly repository: CharacterSheetGateway,
		options: CharacterSheetBrowserControllerOptions = {}
	) {
		this.onStateChange = options.onStateChange;
	}

	private readonly onStateChange?: (state: CharacterSheetBrowserState) => void;

	getState(): CharacterSheetBrowserState {
		return this.state;
	}

	initialize(initialFullItem?: FullCharacterSheet): void {
		this.state = {
			...this.state,
			itemsStack: initialFullItem ? [initialFullItem] : [],
			currentItem: initialFullItem,
		};
		this.publish();
	}

	async refreshGroups(): Promise<void> {
		this.state = { ...this.state, status: "loading", errorMessage: null };
		this.publish();
		try {
			const smallItems = await this.repository.getFilteredSmallItems(
				this.state.searchBarValue.toLowerCase(),
				this.state.filters
			);
			const groups = await this.repository.groupItems(smallItems);
			this.state = { ...this.state, groups, status: "idle" };
			this.publish();
		} catch (error) {
			this.state = {
				...this.state,
				status: "error",
				errorMessage:
					error instanceof Error ? error.message : "Не удалось загрузить список персонажей.",
			};
			this.publish();
		}
	}

	async updateSearch(value: string): Promise<void> {
		this.state = { ...this.state, searchBarValue: value };
		this.publish();
		await this.refreshGroups();
	}

	async openFilters(): Promise<void> {
		const fullFilters = await this.repository.getAllFilters();
		if (!fullFilters) return;
		this.state = { ...this.state, fullFilters, isFiltersOverlayOpen: true };
		this.publish();
	}

	async applyFilters(newFilters: CharacterSheetFilters): Promise<void> {
		this.state = { ...this.state, filters: newFilters, isFiltersOverlayOpen: false };
		this.publish();
		await this.refreshGroups();
	}

	closeFilters(): void {
		this.state = { ...this.state, isFiltersOverlayOpen: false };
		this.publish();
	}

	async openSmallItem(smallItem: SmallCharacterSheet): Promise<void> {
		const currentItem = (await this.repository.getFullItemBySmallItem(smallItem)) ?? undefined;
		if (!currentItem) return;
		this.state = {
			...this.state,
			currentItem,
			itemsStack: [...this.state.itemsStack, currentItem],
			errorMessage: null,
		};
		this.publish();
	}

	goBack(): void {
		if (this.state.itemsStack.length === 0) return;
		const nextStack = this.state.itemsStack.slice(0, -1);
		this.state = {
			...this.state,
			itemsStack: nextStack,
			currentItem: nextStack[nextStack.length - 1],
			errorMessage: null,
		};
		this.publish();
	}

	async importFromText(text: string): Promise<void> {
		this.state = { ...this.state, status: "importing", errorMessage: null };
		this.publish();
		try {
			const importedCharacter = await this.repository.importFromJson(text);
			await this.refreshGroups();
			this.state = {
				...this.state,
				currentItem: importedCharacter,
				itemsStack: [...this.state.itemsStack, importedCharacter],
				status: "idle",
				errorMessage: null,
			};
			this.publish();
		} catch (error) {
			this.state = {
				...this.state,
				status: "error",
				errorMessage:
					error instanceof Error
						? error.message
						: "Не удалось импортировать персонажа. Проверьте формат файла.",
			};
			this.publish();
		}
	}

	clearError(): void {
		if (!this.state.errorMessage) return;
		this.state = { ...this.state, errorMessage: null, status: "idle" };
		this.publish();
	}

	private publish(): void {
		this.onStateChange?.(this.state);
	}
}
