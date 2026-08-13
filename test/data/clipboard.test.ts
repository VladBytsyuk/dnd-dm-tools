import { getEncounterFromClipboard, getEncounterParticipantFromClipboard, getMonsterFromClipboard, copyMonsterToClipboard, copyTextToClipboard, copyEncounterToClipboard, copySpellToClipboard, copyDmScreenItem, copyWeaponToClipboard, copyArmorToClipboard, copyEquipmentToClipboard, copyArtifactToClipboard, copyBackgroundToClipboard } from "src/data/clipboard";
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockMonster, mockEncounter, mockSpell, mockDmScreenItem, mockWeapon, mockArmor, mockEquipment, mockArtifact, mockBackground } from "../__mocks__/data";
import * as obsidian from "obsidian";

describe('Clipboard', () => {
    beforeEach(() => {
        vi.spyOn(obsidian, 'stringifyYaml').mockImplementation(JSON.stringify);
        vi.spyOn(obsidian, 'parseYaml').mockImplementation(JSON.parse);
        obsidian.Platform.isDesktopApp = false;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should copy text to clipboard', () => {
        // Arrange
        const text = 'Hello, world!';
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyTextToClipboard(text, true);

        // Assert
        expect(writeText).toHaveBeenCalledWith(text);
    });

    it('falls back to document copy when the Clipboard API rejects', async () => {
        const text = 'Fallback text';
        const writeText = vi.fn().mockRejectedValue(new Error('missing remote object'));
        const execCommand = vi.fn().mockReturnValue(true);
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, writable: true });
        Object.defineProperty(document, 'execCommand', { value: execCommand, writable: true });

        await copyTextToClipboard(text, true);

        expect(writeText).toHaveBeenCalledWith(text);
        expect(execCommand).toHaveBeenCalledWith('copy');
    });

    it('should copy monster to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyMonsterToClipboard(mockMonster, true);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockMonster);
        const expectedContent = `\`\`\`statblock
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy encounter to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyEncounterToClipboard(mockEncounter);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockEncounter);
        const expectedContent = `\`\`\`encounter
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy spell to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copySpellToClipboard(mockSpell);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockSpell);
        const expectedContent = `\`\`\`spell
spell: ${mockSpell.name.rus}
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy dm screen item to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyDmScreenItem(mockDmScreenItem);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockDmScreenItem);
        const expectedContent = `\`\`\`screen
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy weapon to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyWeaponToClipboard(mockWeapon);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockWeapon);
        const expectedContent = `\`\`\`weapon
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy armor to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyArmorToClipboard(mockArmor);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockArmor);
        const expectedContent = `\`\`\`armor
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy equipment to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyEquipmentToClipboard(mockEquipment);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockEquipment);
        const expectedContent = `\`\`\`equip
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy artifact to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyArtifactToClipboard(mockArtifact);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockArtifact);
        const expectedContent = `\`\`\`artifact
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should copy background to clipboard', () => {
        // Arrange
        const writeText = vi.fn();
        
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            writable: true,
        });

        // Act
        copyBackgroundToClipboard(mockBackground);

        // Assert
        const expectedYaml = obsidian.stringifyYaml(mockBackground);
        const expectedContent = `\`\`\`background
${expectedYaml}
\`\`\``;
        expect(writeText).toHaveBeenCalledWith(expectedContent);
    });

    it('should get monster from clipboard', async () => {
        // Arrange
        const yaml = obsidian.stringifyYaml(mockMonster);
        const clipboardContent = `\`\`\`statblock
${yaml}
\`\`\``;
        const readText = vi.fn().mockResolvedValue(clipboardContent);

        Object.defineProperty(navigator, 'clipboard', {
            value: { readText },
            writable: true,
        });

        // Act
        const monster = await getMonsterFromClipboard(true);

        // Assert
        expect(monster).toEqual(mockMonster);
    });

    it('should get monster from a statblock with surrounding whitespace and CRLF', async () => {
        const yaml = obsidian.stringifyYaml(mockMonster).replace(/\n/g, '\r\n');
        const clipboardContent = `  \r\n\`\`\`statblock\r\n${yaml}\r\n\`\`\`\r\n  `;
        const readText = vi.fn().mockResolvedValue(clipboardContent);

        Object.defineProperty(navigator, 'clipboard', {
            value: { readText },
            writable: true,
        });

        const monster = await getMonsterFromClipboard(true);

        expect(monster).toEqual(mockMonster);
    });

    it('should get encounter participant from clipboard', async () => {
        // Arrange
        const yaml = obsidian.stringifyYaml(mockMonster);
        const clipboardContent = `\`\`\`statblock
${yaml}
\`\`\``;
        const readText = vi.fn().mockResolvedValue(clipboardContent);

        Object.defineProperty(navigator, 'clipboard', {
            value: { readText },
            writable: true,
        });

        // Act
        const participant = await getEncounterParticipantFromClipboard(true);

        // Assert
        expect(participant?.name).toBe(mockMonster.name.rus);
        expect(participant?.armorClass).toBe(mockMonster.armorClass);
    });

    it('should get encounter from clipboard', async () => {
        // Arrange
        const encounterWithResources = {
            ...mockEncounter,
            participants: [{
                id: 1,
                initiative: 12,
                initiativeModifier: 2,
                name: 'Маг',
                hpCurrent: 20,
                hpTemporary: 0,
                hpMax: 20,
                armorClass: 14,
                passivePerception: 11,
                side: 'pc' as const,
                isDead: false,
                conditions: [],
                spellSlots: [{ level: 2, total: 3, used: 1 }],
                resources: [{ id: 'rage', name: 'Ярость', total: 2, used: 1 }],
            }],
        };
        const yaml = obsidian.stringifyYaml(encounterWithResources);
        const clipboardContent = `\`\`\`encounter
${yaml}
\`\`\``;
        const readText = vi.fn().mockResolvedValue(clipboardContent);

        Object.defineProperty(navigator, 'clipboard', {
            value: { readText },
            writable: true,
        });

        // Act
        const encounter = await getEncounterFromClipboard();

        // Assert
        expect(encounter).toEqual(encounterWithResources);
    });

    it('reads an encounter from the clipboard with one action on desktop', async () => {
        const yaml = obsidian.stringifyYaml(mockEncounter);
        const clipboardContent = `\`\`\`encounter
${yaml}
\`\`\``;
        const readText = vi.fn().mockResolvedValue(clipboardContent);
        obsidian.Platform.isDesktopApp = true;
        Object.defineProperty(navigator, 'clipboard', { value: { readText }, writable: true });

        await expect(getEncounterFromClipboard()).resolves.toEqual(mockEncounter);
        expect(readText).toHaveBeenCalledOnce();
    });

});
