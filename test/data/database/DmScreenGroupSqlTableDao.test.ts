import { describe, expect, it, vi } from "vitest";
import { DmScreenGroupSqlTableDao } from "src/data/database/DmScreenGroupSqlTableDao";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";

const item: DmScreenItem = {
	name: { rus: "Очарованный", eng: "Charmed" },
	url: "/screens/charmed",
	order: 2,
	source: {
		shortName: "PHB",
		name: "Книга игрока",
		group: { shortName: "Basic", name: "Основные правила" },
	},
	group: "Состояния",
	icon: "charmed",
	description: "<p>Описание</p>",
	parentUrl: "/screens/conditions",
};

describe("DmScreenGroupSqlTableDao", () => {
	it("updates icon and parent URL together with other imported fields", async () => {
		const database = { exec: vi.fn() };
		const dao = new DmScreenGroupSqlTableDao(database as any, {} as any, {} as any);

		await dao.updateItem(item);

		const [query, values] = database.exec.mock.calls[0];
		expect(query).toContain("icon = ?");
		expect(query).toContain("parent_url = ?");
		expect(values).toContain(item.icon);
		expect(values).toContain(item.parentUrl);
	});
});
