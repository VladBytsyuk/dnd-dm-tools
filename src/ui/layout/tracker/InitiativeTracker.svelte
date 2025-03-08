<script lang="ts">
	import { d20, roll } from "src/domain/dice";
    import { Pencil, ClipboardCopy, ClipboardPaste, Play, StepForward, Ban, Dices, Sword, Heart, Shield, Check, Eraser, Plus } from 'lucide-svelte';
	import type { Encounter, EncounterParticipant } from "src/domain/encounter";
	import { formatModifier } from "src/domain/modifier";
	import { copyEncounterToClipboard, getEncounterFromClipboard, getEncounterParticipantFromClipboard } from "src/data/clipboard";

    let encounter: Encounter = { name: "", participants: [] };
    let idCounter: number = 0;
    let calcTempValues = new Map();
    let isEncounterEditing: boolean = false;

    let activeParticipantIndex: number | null = null;

    const startEncounter = () => {
        sortByInitiative();
        activeParticipantIndex = 0;
    };

    const nextStepEncounter = () => {
        if (activeParticipantIndex != null) {
            activeParticipantIndex = (activeParticipantIndex + 1) % encounter.participants.length;
        } else {
            startEncounter();
        }
    };

    const stopEncounter = () => {
        activeParticipantIndex = null;
    };

    const rollInitiative = () => {
        updateParticipants(encounter.participants.map((it) => it.initiative !== 0 ? it : ({...it, initiative: roll(d20()(it.initiativeModifier))})));
    };

    const sortByInitiative = () => {
        updateParticipants(encounter.participants.sort((a, b) => b.initiative - a.initiative));
    }

    const addParticipant = () => {
        const newParticipants = [
            ...encounter.participants,
            {
				id: idCounter++,
				isEditing: true,
				initiative: 0,
				initiativeModifier: 0,
				name: "",
				hpCurrent: 0,
				hpTemporary: 0,
				hpMax: 0,
				armorClass: 0
			} as unknown as EncounterParticipant,
        ].sort((a, b) => b.initiative - a.initiative);
        updateParticipants(newParticipants);
    }

    const removeParticipant = (id: number) => {
        updateParticipants(encounter.participants.filter(it => it.id !== id));
    }

    const toggleEditing = (id: number) => {
        updateParticipants(encounter.participants.map((it) => it.id !== id ? it : ({...it, isEditing: !it.isEditing})));
    }

    const addMonsterFromClipboard = async () => {
        const clipboard = await getEncounterParticipantFromClipboard();
        if (clipboard) {
            const newParticipants = [
                ...encounter.participants,
                clipboard,
            ].sort((a, b) => b.initiative - a.initiative);
            updateParticipants(newParticipants);
        }
    };

    const fillEncounterFromClipboard = async () => {
        const clipboard = await getEncounterFromClipboard();
        if (clipboard) {
            encounter = clipboard;
        }
    };

    const handleKeyPress = (e: any, participant: EncounterParticipant, field: string) => {
        if (e.key === 'Enter') {
            const result = evaluateExpression(e.target.value);
            if (!isNaN(result)) {
                updateParticipants(encounter.participants.map(it => it.id === participant.id ? { ...it, [field]: Number(result) } : it));
                calcTempValues.delete(`${participant.id}-${field}`);
            }
            e.target.blur();
        } else {
            calcTempValues.set(`${participant.id}-${field}`, e.target.value);
        }
    };

    const handleBlur = (e: any, participant: EncounterParticipant, field: string) => {
        const result = evaluateExpression(e.target.value);
        if (!isNaN(result)) {
            updateParticipants(encounter.participants.map(it => it.id === participant.id ? { ...it, [field]: Number(result) } : it));
            calcTempValues.delete(`${participant.id}-${field}`);
        }
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
        encounter = { ...encounter, participants: newParticipants };
    };
</script>

<div class="initiative-tracker">
    <div class="initiative-tracker-header">
        {#if isEncounterEditing}
            <input class="participants-list-cell-name" bind:value={encounter.name} placeholder={encounter.name}>
        {:else}
            <div>{encounter.name}</div>
        {/if}
        {#if isEncounterEditing}
            <button class="initiative-tracker-header-button" on:click={() => isEncounterEditing = false}><Check/></button>
        {:else}
            <button class="initiative-tracker-header-button" on:click={() => isEncounterEditing = true}><Pencil/></button>
        {/if}
        <button class="initiative-tracker-header-button" on:click={() => copyEncounterToClipboard(encounter)}><ClipboardCopy/></button>
        <button class="initiative-tracker-header-button" on:click={() => fillEncounterFromClipboard()}><ClipboardPaste/></button>
        <button class="initiative-tracker-header-button" on:click={() => nextStepEncounter()}>
            {#if activeParticipantIndex !== null}<StepForward/>{:else}<Play/>{/if}
        </button>
        <button class="initiative-tracker-header-button" on:click={() => stopEncounter()}><Ban/></button>
    </div>
    <div class="participants-list">
        <div class="participants-list-row">
            <button class="participants-list-cell-header-value" on:click={() => rollInitiative()}><Dices/></button>
            <button class="participants-list-cell-header-value" on:click={() => sortByInitiative()}><Sword/></button>
            <div class="participants-list-cell-name">Имя</div>
            <div class="participants-list-cell-header-value"><Heart/></div>
            <div class="participants-list-cell-header-value"><Shield/></div>
            <div class="participants-list-cell-header-value"></div>
        </div>
        {#each encounter.participants as participant, index (participant.id)}
            <div class="participants-list-row">
                <button class="participants-list-cell-header-value" class:active-row={activeParticipantIndex === index}
                    on:click={() => toggleEditing(participant.id)}
                >
                    {#if participant.isEditing}<Check/>{:else}<Pencil/>{/if}
                </button>
                <input class="participants-list-cell-value" class:active-row={activeParticipantIndex === index}
                    placeholder={formatModifier(participant.initiativeModifier)}
                    value={calcTempValues.get(`${participant.id}-initiative`) ?? participant.initiative}
                    on:keydown={(e) => handleKeyPress(e, participant, 'initiative')}
                    on:blur={(e) => handleBlur(e, participant, 'initiative')}
                />
                {#if participant.isEditing}
                    <input class="participants-list-cell-name" class:active-row={activeParticipantIndex === index} bind:value={participant.name} placeholder={participant.name}>
                {:else}
                    <div class="participants-list-cell-name" class:active-row={activeParticipantIndex === index}>{participant.name}</div>
                {/if}
                {#if participant.isEditing}
                    <div class="participants-list-cell-hp" class:active-row={activeParticipantIndex === index}>
                        <input class="participants-list-cell-hp-item" id="hp-current"
                            placeholder={formatModifier(participant.hpMax)}
                            value={calcTempValues.get(`${participant.id}-hpCurrent`) ?? participant.hpCurrent}
                            on:keydown={(e) => handleKeyPress(e, participant, 'hpCurrent')}
                            on:blur={(e) => handleBlur(e, participant, 'hpCurrent')}
                        />
                        <input class="participants-list-cell-hp-item" id="hp-temporary" 
                            placeholder={formatModifier(participant.hpTemporary)}
                            value={calcTempValues.get(`${participant.id}-hpTemporary`) ?? participant.hpTemporary}
                            on:keydown={(e) => handleKeyPress(e, participant, 'hpTemporary')}
                            on:blur={(e) => handleBlur(e, participant, 'hpTemporary')}
                        />
                        <input class="participants-list-cell-hp-item" id="hp-max" 
                            placeholder={formatModifier(participant.hpMax)}
                            value={calcTempValues.get(`${participant.id}-hpMax`) ?? participant.hpMax}
                            on:keydown={(e) => handleKeyPress(e, participant, 'hpMax')}
                            on:blur={(e) => handleBlur(e, participant, 'hpMax')}
                        />
                    </div>
                {:else}
                    <div class="participants-list-cell-value" class:active-row={activeParticipantIndex === index}>
                        {participant.hpCurrent}{participant.hpTemporary == 0 ? '' : '+' + participant.hpTemporary}/{participant.hpMax}
                    </div>
                {/if}
                {#if participant.isEditing}
                    <input class="participants-list-cell-value" class:active-row={activeParticipantIndex === index} 
                        placeholder={formatModifier(participant.armorClass)}
                        value={calcTempValues.get(`${participant.id}-armorClass`) ?? participant.armorClass}
                        on:keydown={(e) => handleKeyPress(e, participant, 'armorClass')}
                        on:blur={(e) => handleBlur(e, participant, 'armorClass')}
                    />
                {:else}
                    <div class="participants-list-cell-value" class:active-row={activeParticipantIndex === index}>{participant.armorClass}</div>
                {/if}
                <button class="participants-list-cell-header-value" class:active-row={activeParticipantIndex === index} on:click={() => removeParticipant(participant.id)}><Eraser/></button>
            </div>
        {/each}

        <!--Ряд добавления-->
        <div class="participants-list-cell-footer">
            <button class="participants-list-cell-add" on:click={(e) => addParticipant()}><Plus/></button>
            <button class="participants-list-cell-header-value" on:click={(e) => addMonsterFromClipboard()}><ClipboardPaste/></button>
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
        grid-template-columns: 4fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr;        
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
        background: #ffffff44;
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
        background-color: #00000022;
        padding: 0px 5px;
        margin-right: 2px;
        border-radius: 4px;
        height: 40px;
        line-height: 40px;
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
