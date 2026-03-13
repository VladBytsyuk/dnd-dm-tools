import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityLinkService } from "../../../src/domain/services/EntityLinkService";

describe("EntityLinkService", () => {
	let database: any;
	let service: EntityLinkService;

	beforeEach(() => {
		database = {
			fullArmorDao: {
				readItemByUrl: vi.fn()
			},
			fullArtifactDao: {
				readItemByUrl: vi.fn()
			},
			fullItemDao: {
				readItemByUrl: vi.fn()
			},
			smallArmorDao: {
				readAllItems: vi.fn()
			}
		};
		service = new EntityLinkService(database);
	});

	it("loads linked armor entries by URL", async () => {
		const armor = { url: "/armors/plate", name: { rus: "Латы", eng: "Plate" } };
		database.fullArmorDao.readItemByUrl.mockResolvedValue(armor);

		await expect(service.getLinkedEquipmentByUrl("/armors/plate", "armor")).resolves.toEqual(armor);
		expect(database.fullArmorDao.readItemByUrl).toHaveBeenCalledWith("/armors/plate");
		expect(database.fullArtifactDao.readItemByUrl).not.toHaveBeenCalled();
		expect(database.fullItemDao.readItemByUrl).not.toHaveBeenCalled();
	});

	it("finds armor by Russian or English name", async () => {
		database.smallArmorDao.readAllItems.mockResolvedValue([
			{ url: "/armors/plate", name: { rus: "Латы", eng: "Plate" } }
		]);

		await expect(service.findArmor("латы")).resolves.toEqual({
			exists: true,
			url: "/armors/plate",
			name: { rus: "Латы", eng: "Plate" }
		});
		await expect(service.findArmor("plate")).resolves.toEqual({
			exists: true,
			url: "/armors/plate",
			name: { rus: "Латы", eng: "Plate" }
		});
		expect(database.smallArmorDao.readAllItems).toHaveBeenCalledTimes(1);
	});
});
