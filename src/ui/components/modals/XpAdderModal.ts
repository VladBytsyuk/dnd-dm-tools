import { App, Modal, Setting } from "obsidian";

/**
 * Modal for adding experience points to a character's current XP total.
 */
export class XpAdderModal extends Modal {
	private xpToAdd: number = 0;

	constructor(
		app: App,
		private currentXp: number,
		private onSubmit: (additionalXp: number) => void
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h3", { text: "Добавить опыт" });

		new Setting(contentEl)
			.setName("Текущий опыт")
			.setDesc(this.currentXp.toLocaleString('ru-RU'));

		new Setting(contentEl)
			.setName("Добавить опыт")
			.addText((text) =>
				text
					.setPlaceholder("0")
					.onChange((value) => {
						this.xpToAdd = parseInt(value) || 0;
					})
			);

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Добавить")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(this.xpToAdd);
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Отмена")
					.onClick(() => this.close())
			);
	}

	onClose() {
		this.contentEl.empty();
	}
}
