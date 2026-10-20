import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InitiativeTracker from 'src/ui/layout/tracker/InitiativeTracker.svelte';
import { EncounterManager } from 'src/domain/models/encounter/EncounterManager';
import type { Encounter } from 'src/domain/models/encounter/Encounter';

afterEach(cleanup);

const encounter: Encounter = { name: 'Засада', participants: [{ id: 1, name: 'Гоблин', initiative: 12, initiativeModifier: 2, hpCurrent: 7, hpTemporary: 0, hpMax: 7, armorClass: 15, passivePerception: 9, side: 'enemy', isDead: false, conditions: [] }] };
function mountTracker(manager: EncounterManager, onCombatChanged: (active: boolean) => void, isEditable = true) {
	return render(InitiativeTracker, { app: {}, encounter, manager, isEditable, onCombatChanged, onPortraitClick: vi.fn(), onConditionClick: vi.fn(), onImageRequested: vi.fn(async () => ''), onOwlbearSnapshotCreated: vi.fn(async () => {}), onOwlbearTurnChanged: vi.fn(async () => {}) });
}

describe('tracker combat mode lifecycle', () => {
	it('restores combat mode on reopening a retained active encounter without changing its round, turn or participants', async () => {
		const manager = new EncounterManager(encounter), onCombatChanged = vi.fn();
		const first = mountTracker(manager, onCombatChanged);
		await fireEvent.click(screen.getByRole('button', { name: 'Начать столкновение' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Следующий ход' }));
		const before = manager.current;
		expect(onCombatChanged).toHaveBeenLastCalledWith(true);
		first.unmount(); expect(onCombatChanged).toHaveBeenLastCalledWith(false);
		onCombatChanged.mockClear();
		const second = mountTracker(manager, onCombatChanged);
		expect(onCombatChanged).toHaveBeenCalledOnce(); expect(onCombatChanged).toHaveBeenLastCalledWith(true);
		expect(manager.current).toEqual(before);
		expect(screen.getByRole('button', { name: 'Следующий ход' })).toBeTruthy();
		second.unmount(); expect(onCombatChanged).toHaveBeenLastCalledWith(false);
	});
	it('synchronizes an idle editable tracker but does not change combat mode for read-only encounters', () => {
		const manager = new EncounterManager(encounter), onCombatChanged = vi.fn();
		const editable = mountTracker(manager, onCombatChanged);
		expect(onCombatChanged).toHaveBeenCalledOnce(); expect(onCombatChanged).toHaveBeenLastCalledWith(false);
		editable.unmount(); onCombatChanged.mockClear();
		mountTracker(manager, onCombatChanged, false);
		expect(onCombatChanged).not.toHaveBeenCalled();
	});
});
