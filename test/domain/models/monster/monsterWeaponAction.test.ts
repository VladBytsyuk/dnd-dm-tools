import { describe, expect, it } from "vitest";
import { EmptyFullMonster, normalizeMonsterForEditing } from "src/domain/models/monster/FullMonster";
import { createMonsterWeaponAction } from "src/domain/models/monster/monsterWeaponAction";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import {
    fullWeaponBlowgun,
    fullWeaponHalberd,
    fullWeaponMace,
} from "../../../__mocks__/domain/models/weapon/full_weapon_items";

function monster(strength = 14, dexterity = 18, proficiencyBonus = "3") {
    return normalizeMonsterForEditing({
        ...EmptyFullMonster(),
        ability: {
            str: strength,
            dex: dexterity,
            con: 10,
            int: 10,
            wiz: 10,
            cha: 10,
        },
        proficiencyBonus,
    });
}

function weapon(base: FullWeapon, changes: Partial<FullWeapon> = {}): FullWeapon {
    return structuredClone({ ...base, ...changes });
}

describe("createMonsterWeaponAction", () => {
    it("creates a linked melee action using Strength, proficiency, reach, and average damage", () => {
        const action = createMonsterWeaponAction(monster(), fullWeaponHalberd);

        expect(action.name).toBe("Алебарда");
        expect(action.weaponUrl).toBe("/weapons/halberd");
        expect(action.value).toBe('<p><em>Рукопашная атака оружием:</em> <dice-roller label="Атака" formula="к20 + 5">+5</dice-roller> к попаданию, досягаемость 10 фт., одна цель. <em>Попадание:</em>&nbsp;7&nbsp;(<dice-roller label="Урон" formula="1к10 + 2"/>) рубящего урона.</p>');
    });

    it("creates a ranged action using Dexterity and ammunition distance", () => {
        const action = createMonsterWeaponAction(monster(), fullWeaponBlowgun);

        expect(action.value).toContain('<em>Дальнобойная атака оружием:</em>');
        expect(action.value).toContain('formula="к20 + 7">+7</dice-roller>');
        expect(action.value).toContain("дистанция 25/100 фт., одна цель.");
        expect(action.value).toContain("<em>Попадание:</em>&nbsp;5 колющего урона.");
    });

    it("uses the better Strength or Dexterity modifier for finesse weapons", () => {
        const finesseWeapon = weapon(fullWeaponMace, {
            properties: [{ name: "Фехтовальное", url: "/screens/finesse", description: "" }],
        });

        const action = createMonsterWeaponAction(monster(), finesseWeapon);

        expect(action.value).toContain('formula="к20 + 7">+7</dice-roller>');
        expect(action.value).toContain('formula="1к6 + 4"');
        expect(action.value).toContain("&nbsp;7&nbsp;");
    });

    it("creates combined melee and ranged wording for thrown melee weapons", () => {
        const thrownWeapon = weapon(fullWeaponMace, {
            properties: [{ name: "Метательное", url: "/screens/thrown", distance: "20/60", description: "" }],
        });

        const action = createMonsterWeaponAction(monster(), thrownWeapon);

        expect(action.value).toContain("Рукопашная или дальнобойная атака оружием");
        expect(action.value).toContain("досягаемость 5 фт. или дистанция 20/60 фт.");
        expect(action.value).toContain('formula="к20 + 5">+5</dice-roller>');
    });

    it("normalizes d notation and formats negative modifiers", () => {
        const weakWeapon = weapon(fullWeaponMace, { damage: { dice: "1d6", type: "дробящий" } });

        const action = createMonsterWeaponAction(monster(6, 10, "0"), weakWeapon);

        expect(action.value).toContain('formula="к20 - 2">-2</dice-roller>');
        expect(action.value).toContain('formula="1к6 - 2"');
        expect(action.value).toContain("&nbsp;1&nbsp;");
    });

    it("omits a damage roller for fixed damage", () => {
        const fixedWeapon = weapon(fullWeaponMace, { damage: { dice: "1", type: "дробящий" } });

        const action = createMonsterWeaponAction(monster(), fixedWeapon);

        expect(action.value).toContain("<em>Попадание:</em>&nbsp;3 дробящего урона.");
        expect(action.value).not.toContain('label="Урон"');
    });

    it("omits unknown ranged distance instead of inventing one", () => {
        const rangedWeapon = weapon(fullWeaponBlowgun, { properties: [] });

        const action = createMonsterWeaponAction(monster(), rangedWeapon);

        expect(action.value).toContain("к попаданию, одна цель.");
        expect(action.value).not.toContain("дистанция");
    });

    it.each([
        ["invalid URL", weapon(fullWeaponMace, { url: "/items/mace" }), "корректная ссылка"],
        ["missing damage", weapon(fullWeaponMace, { damage: { dice: "", type: "дробящий" } }), "формула урона"],
        ["unsupported formula", weapon(fullWeaponMace, { damage: { dice: "1к6 + 1", type: "дробящий" } }), "не поддерживается"],
        ["no damage weapon", weapon(fullWeaponMace, { damage: { type: "без урона" } }), "не наносит урон"],
    ])("rejects %s", (_label, invalidWeapon, message) => {
        expect(() => createMonsterWeaponAction(monster(), invalidWeapon)).toThrow(message);
    });
});
