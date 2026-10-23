import { Modal, Notice, Setting } from "obsidian";
import type { McpOperation } from "src/data/database/McpOperationsDao";
import type DndStatblockPlugin from "src/main";

const pageSize = 20;
const statusLabels: Record<McpOperation["status"], string> = {
	pending: "Ожидает подтверждения", running: "Выполняется", succeeded: "Выполнено",
	rejected: "Отклонено", failed: "Ошибка", interrupted: "Прервано",
};
const kindLabels: Record<string, string> = {
	bestiary: "Существо", spellbook: "Заклинание", arsenal: "Оружие", armory: "Броня", equipment: "Снаряжение",
	artifactory: "Артефакт", backgrounds: "Предыстория", feats: "Черта", races: "Раса",
	adventure: "Приключение", scene: "Сцена", track: "Трек", playlist: "Плейлист",
};
const actionLabels: Record<string, string> = { create: "Создание", update: "Изменение", delete: "Удаление", undo: "Отмена" };

export class McpHistoryModal extends Modal {
	private offset = 0;
	private generation = 0;
	private opened = false;

	constructor(private readonly plugin: DndStatblockPlugin) { super(plugin.app); }

	onOpen(): void { this.opened = true; void this.load(); }
	onClose(): void { this.opened = false; this.generation++; this.contentEl.empty(); }

	private async load(): Promise<void> {
		const generation = ++this.generation;
		this.contentEl.empty();
		this.contentEl.createEl("h2", { text: "Журнал MCP" });
		const loading = this.contentEl.createEl("p", { text: "Загрузка операций…" });
		try {
			const result = await this.plugin.listMcpOperations(this.offset, pageSize);
			if (!this.opened || generation !== this.generation) return;
			loading.remove();
			if (!result.items.length) this.contentEl.createEl("p", { text: "Операций MCP пока нет." });
			for (const operation of result.items) this.renderOperation(operation);
			const navigation = new Setting(this.contentEl).setName(`Операции: ${result.total ? result.offset + 1 : 0}–${Math.min(result.offset + result.items.length, result.total)} из ${result.total}`);
			navigation.addButton((button) => button.setButtonText("Предыдущие").setDisabled(this.offset === 0).onClick(() => {
				this.offset = Math.max(0, this.offset - pageSize); void this.load();
			}));
			navigation.addButton((button) => button.setButtonText("Следующие").setDisabled(!result.hasMore).onClick(() => {
				this.offset += pageSize; void this.load();
			}));
		} catch (error) {
			if (!this.opened || generation !== this.generation) return;
			loading.textContent = `Не удалось загрузить журнал: ${errorMessage(error)}`;
		}
	}

	private renderOperation(operation: McpOperation): void {
		const details = this.contentEl.createEl("details");
		const summary = operationSummary(operation);
		details.createEl("summary", { text: `${new Date(operation.createdAt).toLocaleString("ru-RU")} · ${statusLabels[operation.status]} · ${summary}${operation.undoneBy ? " · Отменено" : ""}` });
		if (operation.error) details.createEl("p", { text: operation.error.message });
		const changes = details.createDiv();
		let loaded = false;
		details.addEventListener("toggle", () => {
			if (!details.open || loaded) return;
			loaded = true;
			void this.renderChanges(operation.operationId, changes).catch((error) => {
				if (!this.opened || !changes.isConnected) return;
				loaded = false;
				changes.textContent = `Не удалось загрузить изменения: ${errorMessage(error)}`;
			});
		});
		if (operation.status === "succeeded" && !operation.undoneBy && !operation.undoTargetId) {
			new Setting(details).setName("Отмена операции").addButton((button) => button.setButtonText("Отменить операцию").onClick(() => {
				new McpUndoConfirmationModal(this.plugin, operationSummary(operation, true), async () => {
					await this.plugin.undoMcpOperation(operation.operationId);
					if (this.opened) await this.load();
				}).open();
			}));
		}
	}

	private async renderChanges(id: string, container: HTMLElement): Promise<void> {
		const operation = await this.plugin.getMcpOperation(id, true);
		if (!this.opened || !container.isConnected) return;
		container.empty();
		if (!operation?.changes?.length) { container.createEl("p", { text: "Нет сохранённых изменений." }); return; }
		for (const change of operation.changes) {
			container.createEl("h3", { text: `${kindLabels[change.kind] ?? change.kind}: ${change.url}` });
			container.createEl("p", { text: "До операции" });
			container.createEl("pre", { text: JSON.stringify(change.before, null, 2) });
			container.createEl("p", { text: "После операции" });
			container.createEl("pre", { text: JSON.stringify(change.after, null, 2) });
		}
	}
}

class McpUndoConfirmationModal extends Modal {
	constructor(plugin: DndStatblockPlugin, private readonly summary: string, private readonly confirm: () => Promise<void>) { super(plugin.app); }
	onOpen(): void {
		this.contentEl.createEl("h2", { text: "Отменить операцию MCP?" });
		this.contentEl.createEl("p", { text: this.summary });
		this.contentEl.createEl("p", { text: "Изменения будут отменены, только если данные после операции не менялись." });
		new Setting(this.contentEl)
			.addButton((button) => button.setButtonText("Назад").onClick(() => this.close()))
			.addButton((button) => button.setButtonText("Подтвердить отмену").onClick(async () => {
				button.setDisabled(true);
				try { await this.confirm(); this.close(); }
				catch (error) { new Notice(`Не удалось отменить операцию: ${errorMessage(error)}`); button.setDisabled(false); }
			}));
	}
	onClose(): void { this.contentEl.empty(); }
}

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }

function operationSummary(operation: McpOperation, undo = false): string {
	return operation.summary?.map((item) => {
		const action = undo && ["create", "Создание"].includes(item.action) ? "Удаление созданной сущности"
			: undo && ["update", "Изменение"].includes(item.action) ? "Восстановление предыдущей версии" : actionLabels[item.action] ?? item.action;
		return `${action}: ${kindLabels[item.kind] ?? item.kind} «${(item.name || item.url).replace(/\s+/g, " ").slice(0, 160)}»`;
	}).join("; ") || operation.operationId;
}
