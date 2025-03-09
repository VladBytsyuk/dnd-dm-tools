<script lang="ts">
	import { d20, roll } from "src/domain/dice";
    import { Pencil, ClipboardCopy, ClipboardPaste, Play, StepForward, Ban, Dices, Sword, Heart, Shield, Check, Eraser, Plus } from 'lucide-svelte';
	import type { Encounter, EncounterParticipant } from "src/domain/encounter";
	import { formatModifier } from "src/domain/modifier";
	import { copyEncounterToClipboard, getEncounterFromClipboard, getEncounterParticipantFromClipboard } from "src/data/clipboard";

    let { encounter } = $props();
    let stateEncounter: Encounter = $state(encounter);
    let idCounter: number = 0;
    let calcTempValues = new Map();
    let editingId = $state<string | null>(null);

    let activeParticipantIndex: number | null = $state(null);

    const saveEncounterToClipboard = () => copyEncounterToClipboard(stateEncounter);

    const fillEncounterFromClipboard = async () => {
        const clipboard = await getEncounterFromClipboard();
        if (clipboard) {
            stateEncounter = clipboard;
            idCounter = clipboard.participants.length;
        }
    };

    const startEncounter = () => {
        rollInitiative();
        sortByInitiative();
        activeParticipantIndex = 0;
    };

    const nextStepEncounter = () => {
        if (activeParticipantIndex != null) {
            activeParticipantIndex = (activeParticipantIndex + 1) % stateEncounter.participants.length;
        } else {
            startEncounter();
        }
    };

    const stopEncounter = () => {
        activeParticipantIndex = null;
    };

    const rollInitiative = () => {
        updateParticipants(stateEncounter.participants.map((it) => it.initiative !== 0 ? it : ({...it, initiative: roll(d20()(it.initiativeModifier))})));
    };

    const sortByInitiative = () => {
        updateParticipants(stateEncounter.participants.sort((a, b) => b.initiative - a.initiative));
    }

    const removeParticipant = (id: number) => {
        updateParticipants(stateEncounter.participants.filter(it => it.id !== id));
    }

    const addParticipant = () => {
        const newParticipants = [
            ...stateEncounter.participants,
            {
				id: idCounter++,
				isEditing: true,
				initiative: 0,
				initiativeModifier: 0,
				name: "",
				hpCurrent: 0,
				hpTemporary: 0,
				hpMax: 0,
				armorClass: 0,
			} as unknown as EncounterParticipant,
        ];
        updateParticipants(newParticipants);
    }

    const addMonsterFromClipboard = async () => {
        const clipboard = await getEncounterParticipantFromClipboard();
        if (clipboard) {
            const newParticipants = [
                ...stateEncounter.participants,
                clipboard,
            ];
            updateParticipants(newParticipants);
        }
    };

    const handleKeyPress = (e: any, participant: EncounterParticipant, field: string) => {
        const id = `${participant.id}-${field}`;
        if (e.key === 'Enter') {
            const result = evaluateExpression(e.target.value);
            if (!isNaN(result)) {
                updateParticipants(stateEncounter.participants.map(it => it.id === participant.id ? { ...it, [field]: Number(result) } : it));
                calcTempValues.delete(id);
            }
            e.target.blur();
            removeEditingState(id);
        } else {
            calcTempValues.set(id, e.target.value);
        }
    };

    const handleBlur = (e: any, participant: EncounterParticipant, field: string) => {
        const id = `${participant.id}-${field}`
        const result = evaluateExpression(e.target.value);
        if (!isNaN(result)) {
            updateParticipants(stateEncounter.participants.map(it => it.id === participant.id ? { ...it, [field]: Number(result) } : it));
            calcTempValues.delete(id);
        }
        removeEditingState(id);
    };

    const evaluateExpression = (input: string) => {
        try {
            const sanitized = input
                .replace(/,/g, '.')
                .replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
            return new Function(`return ${sanitized}`)();
        } catch (e) {
            return NaN;
        }
    };

    const updateParticipants = (newParticipants: EncounterParticipant[]) => {
        stateEncounter = { ...stateEncounter, participants: newParticipants };
    };

    const handleEditingKeyPress = (e: any, id: string) => {
        if (e.key === 'Enter') {
            removeEditingState(id);
            e.target.blur();
        }
    };

    const addEditingState = (id: string): void => {
        editingId = id;
    }

    const removeEditingState = (id: string): void => {
        editingId = null;
    }
</script>

<div class="initiative-tracker">
    <div class="initiative-tracker-header">
        {#if editingId === "encounter-name"}
            <input class="participants-list-cell-name" 
                bind:value={stateEncounter.name} 
                placeholder={stateEncounter.name}
                onkeypress={(e) => handleEditingKeyPress(e, "encounter-name")}
                onblur={(e) => removeEditingState("encounter-name")}
                />
        {:else}
            <button class="participants-list-cell-name" onclick={() => addEditingState("encounter-name")}>{stateEncounter.name}</button>
        {/if}
        <button class="initiative-tracker-header-button" onclick={saveEncounterToClipboard}><ClipboardCopy/></button>
        <button class="initiative-tracker-header-button" onclick={fillEncounterFromClipboard}><ClipboardPaste/></button>
        <button class="initiative-tracker-header-button" onclick={nextStepEncounter}>
            {#if activeParticipantIndex !== null}<StepForward/>{:else}<Play/>{/if}
        </button>
        <button class="initiative-tracker-header-button" onclick={() => stopEncounter()}><Ban/></button>
    </div>
    <div class="participants-list">
        <div class="participants-list-row">
            <button class="participants-list-cell-header-value" onclick={() => rollInitiative()}><Dices/></button>
            <button class="participants-list-cell-header-value" onclick={() => sortByInitiative()}><Sword/></button>
            <div class="participants-list-cell-name">Имя</div>
            <div class="participants-list-cell-header-value"><Heart/></div>
            <div class="participants-list-cell-header-value"><Shield/></div>
            <div class="participants-list-cell-header-value"></div>
        </div>
        {#each stateEncounter.participants as participant, index (participant.id)}
            <div class="participants-list-row">
                <div class="participants-list-cell-header-value" class:active-row={activeParticipantIndex === index}></div>
                {#if editingId === `${participant.id}-initiative`}
                    <input class="participants-list-cell-value" class:active-row={activeParticipantIndex === index}
                        placeholder={formatModifier(participant.initiativeModifier)}
                        value={calcTempValues.get(`${participant.id}-initiative`) ?? participant.initiative}
                        onkeydown={(e) => handleKeyPress(e, participant, 'initiative')}
                        onblur={(e) => handleBlur(e, participant, 'initiative')}
                    />
                {:else}
                    <button class="participants-list-cell-value" class:active-row={activeParticipantIndex === index} 
                        onclick={() => addEditingState(`${participant.id}-initiative`)}
                    >
                        {participant.initiative}
                    </button>
                {/if}
                {#if editingId === `${participant.id}-name`}
                    <input class="participants-list-cell-name" class:active-row={activeParticipantIndex === index} 
                        bind:value={participant.name} 
                        placeholder={participant.name}
                        onkeypress={(e) => handleEditingKeyPress(e, `${participant.id}-name`)}
                        onblur={(e) => removeEditingState(`${participant.id}-name`)}
                    />
                {:else}
                    <button class="participants-list-cell-name" class:active-row={activeParticipantIndex === index}
                        onclick={() => addEditingState(`${participant.id}-name`)}
                    >
                        {participant.name}
                    </button>
                {/if}
                {#if editingId === `${participant.id}-hp`}
                    <div class="participants-list-cell-hp" class:active-row={activeParticipantIndex === index}>
                        <input class="participants-list-cell-hp-item" id="hp-current"
                            placeholder={formatModifier(participant.hpMax)}
                            value={calcTempValues.get(`${participant.id}-hpCurrent`) ?? participant.hpCurrent}
                            onkeydown={(e) => handleKeyPress(e, participant, 'hpCurrent')}
                            onblur={(e) => handleBlur(e, participant, 'hpCurrent')}
                        />
                        <input class="participants-list-cell-hp-item" id="hp-temporary" 
                            placeholder={formatModifier(participant.hpTemporary)}
                            value={calcTempValues.get(`${participant.id}-hpTemporary`) ?? participant.hpTemporary}
                            onkeydown={(e) => handleKeyPress(e, participant, 'hpTemporary')}
                            onblur={(e) => handleBlur(e, participant, 'hpTemporary')}
                        />
                        <input class="participants-list-cell-hp-item" id="hp-max" 
                            placeholder={formatModifier(participant.hpMax)}
                            value={calcTempValues.get(`${participant.id}-hpMax`) ?? participant.hpMax}
                            onkeydown={(e) => handleKeyPress(e, participant, 'hpMax')}
                            onblur={(e) => handleBlur(e, participant, 'hpMax')}
                        />
                    </div>
                {:else}
                    <button class="participants-list-cell-value" class:active-row={activeParticipantIndex === index}
                        onclick={() => addEditingState(`${participant.id}-hp`)}
                    >
                        {participant.hpCurrent}{participant.hpTemporary == 0 ? '' : '+' + participant.hpTemporary}/{participant.hpMax}
                    </button>
                {/if}
                {#if editingId === `${participant.id}-armorClass`}
                    <input class="participants-list-cell-value" class:active-row={activeParticipantIndex === index} 
                        placeholder={formatModifier(participant.armorClass)}
                        value={calcTempValues.get(`${participant.id}-armorClass`) ?? participant.armorClass}
                        onkeydown={(e) => handleKeyPress(e, participant, 'armorClass')}
                        onblur={(e) => handleBlur(e, participant, 'armorClass')}
                    />
                {:else}
                    <button class="participants-list-cell-value" class:active-row={activeParticipantIndex === index}
                        onclick={() => addEditingState(`${participant.id}-armorClass`)}
                    >
                        {participant.armorClass}
                    </button>
                {/if}
                <button class="participants-list-cell-header-value" class:active-row={activeParticipantIndex === index} 
                    onclick={() => removeParticipant(participant.id)}
                >
                    <Eraser/>
                </button>
            </div>
        {/each}

        <!--Ряд добавления-->
        <div class="participants-list-cell-footer">
            <button class="participants-list-cell-add" onclick={(e) => addParticipant()}><Plus/></button>
            <button class="participants-list-cell-header-value" onclick={(e) => addMonsterFromClipboard()}><ClipboardPaste/></button>
        </div>
    </div>
</div>

<style>
    .initiative-tracker {
        padding: 10px;
        min-width: 35em;
    }

    .initiative-tracker-header {
        font-size: large;
        font-weight: 600;
        margin: 0 0 10px;
        display: grid;
        grid-template-columns: 4fr 0.5fr 0.5fr 0.5fr 0.5fr;        
        position: relative;
        cursor: default;
        width: 100%;
        height: 40px;
        line-height: 40px;
    }

    .initiative-tracker-header-button {
        background-color: #00000022;
        margin-left: 2px;
        height: 40px;
    }

    .initiative-tracker-header-button:hover {
        background-color: #00000044;
    }

    .active-row {
        background-color: #bbbbbb44 !important;
        font-weight: 800;
    }

    .participants-list-row {
        display: grid;
        grid-template-columns: 0.75fr 0.75fr 4fr 2fr 0.75fr 0.75fr;
        position: relative;
        cursor: default;
        width: 100%;
        margin: 2px 0;
        height: 40px;
    }

    .participants-list-cell-header-value {
        background-color: #00000022;
        padding: 8px 0px;
        margin-right: 2px;
        text-align: center;
        border-radius: 4px; 
        min-width: 0;
        height: 40px;
    }

    .participants-list-cell-header-value:hover{
        background-color: #00000044;
    }

    .participants-list-cell-value {
        background-color: #00000022;
        padding: 0px 0px;
        margin-right: 2px;
        text-align: center;
        border-radius: 4px; 
        min-width: 0;
        height: 40px;
        line-height: 40px;
    }

    .participants-list-cell-value:hover{
        background-color: #00000044;
    }

    .participants-list-cell-hp {
        background-color: #00000022;
        margin-right: 2px;
        text-align: center;
        border-radius: 4px; 
        min-width: 0;
        display: grid;
        grid-template-columns: 1fr 0.5fr;
        grid-template-rows: auto auto;
    }

    .participants-list-cell-hp-item {
        background-color: #00000022;
        border-radius: 4px; 
        text-align: center;
        min-width: 0;
    }

    .participants-list-cell-hp-item:hover{
        background-color: #00000044;
    }

    #hp-current {
        grid-column: 1;
        grid-row: 1;
    }

    #hp-temporary {
        grid-column: 2;
        grid-row: 1;
    }

    #hp-max {
        grid-column: 1 / span 2;
        grid-row: 2;
    }

    .participants-list-cell-name {
        display: block;
        width: 100%;
        background-color: #00000022;
        padding: 0px 5px;
        margin-right: 2px;
        border-radius: 4px;
        height: 40px;
        line-height: 40px;
        text-align: left;
    }

    .participants-list-cell-name:hover{
        background-color: #00000044;
    }

    .participants-list-cell-footer {
        display: grid;
        grid-template-columns: 4fr 0.5fr; 
    }

    .participants-list-cell-add {
        width: 100%;
        margin-right: 2px;
        padding: 8px 0px;
        background-color: #00000022;
        border-radius: 4px;
        height: 40px;
        align-items: center;
        text-align:center;
    }

    .participants-list-cell-add:hover{
        background-color: #00000044;
    }
</style>
