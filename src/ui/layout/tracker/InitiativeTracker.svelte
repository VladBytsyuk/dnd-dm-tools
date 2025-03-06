<script lang="ts">
	import { d20, roll } from "src/domain/dice";
	import type { Encounter, EncounterParticipant } from "src/domain/encounter";

    let encounter: Encounter = { participants: [] };
    let idCounter: number = 0;
    let calcTempValues = new Map();

    const modifier = (value: number) => {
        return value >= 0 ? `+${value}` : value.toString();
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
    }

    const handleBlur = (e: any, participant: EncounterParticipant, field: string) => {
        const result = evaluateExpression(e.target.value);
        if (!isNaN(result)) {
            updateParticipants(encounter.participants.map(it => it.id === participant.id ? { ...it, [field]: Number(result) } : it));
            calcTempValues.delete(`${participant.id}-${field}`);
        }
    }

    const evaluateExpression = (input: string) => {
        try {
            const sanitized = input
                .replace(/,/g, '.')
                .replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
            return new Function(`return ${sanitized}`)();
        } catch (e) {
            return NaN;
        }
    }

    const updateParticipants = (newParticipants: EncounterParticipant[]) => {
        encounter = { participants: newParticipants };
    }
</script>

<div class="initiative-tracker">
    <div class="participants-list">
        <div class="participants-list-row">
            <div class="participants-list-cell-header-value">
                <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                    class="lucide lucide-dices"
                    on:click={() => rollInitiative()}
                >
                    <rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
                    <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
                    <path d="M6 18h.01"/>
                    <path d="M10 14h.01"/>
                    <path d="M15 6h.01"/>
                    <path d="M18 9h.01"/>
                </svg>
            </div>
            <div class="participants-list-cell-header-value" >
                <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                    class="lucide lucide-sword" 
                    on:click={() => sortByInitiative()}
                >
                    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                    <line x1="13" x2="19" y1="19" y2="13"/>
                    <line x1="16" x2="20" y1="16" y2="20"/>
                    <line x1="19" x2="21" y1="21" y2="19"/>
                </svg>
            </div>
            <div class="participants-list-cell-name">Имя</div>
            <div class="participants-list-cell-header-value">
                <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                    class="lucide lucide-heart"
                >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
            </div>
            <div class="participants-list-cell-header-value">
                <svg xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                    class="lucide lucide-shield"
                >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                </svg>
            </div>
            <div class="participants-list-cell-header-value"></div>
        </div>
        {#each encounter.participants as participant (participant.id)}
            <div class="participants-list-row">
                <div class="participants-list-cell-header-value">
                    {#if participant.isEditing}
                        <svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                            class="lucide lucide-check" 
                            on:click={() => toggleEditing(participant.id)}
                        >
                            <path d="M20 6 9 17l-5-5"/>
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                            class="lucide lucide-pencil" 
                            on:click={() => toggleEditing(participant.id)}
                        >
                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                            <path d="m15 5 4 4"/>
                        </svg>
                    {/if}
                </div>
                <input class="participants-list-cell-value" 
                    placeholder={modifier(participant.initiativeModifier)}
                    value={calcTempValues.get(`${participant.id}-initiative`) ?? participant.initiative}
                    on:keydown={(e) => handleKeyPress(e, participant, 'initiative')}
                    on:blur={(e) => handleBlur(e, participant, 'initiative')}
                />
                {#if participant.isEditing}
                    <input class="participants-list-cell-name" bind:value={participant.name} placeholder={participant.name}>
                {:else}
                    <div class="participants-list-cell-name">{participant.name}</div>
                {/if}
                {#if participant.isEditing}
                    <div class="participants-list-cell-hp">
                        <input class="participants-list-cell-hp-item" id="hp-current"
                            placeholder={modifier(participant.hpMax)}
                            value={calcTempValues.get(`${participant.id}-hpCurrent`) ?? participant.hpCurrent}
                            on:keydown={(e) => handleKeyPress(e, participant, 'hpCurrent')}
                            on:blur={(e) => handleBlur(e, participant, 'hpCurrent')}
                        />
                        <input class="participants-list-cell-hp-item" id="hp-temporary" 
                            placeholder={modifier(participant.hpTemporary)}
                            value={calcTempValues.get(`${participant.id}-hpTemporary`) ?? participant.hpTemporary}
                            on:keydown={(e) => handleKeyPress(e, participant, 'hpTemporary')}
                            on:blur={(e) => handleBlur(e, participant, 'hpTemporary')}
                        />
                        <input class="participants-list-cell-hp-item" id="hp-max" 
                            placeholder={modifier(participant.hpMax)}
                            value={calcTempValues.get(`${participant.id}-hpMax`) ?? participant.hpMax}
                            on:keydown={(e) => handleKeyPress(e, participant, 'hpMax')}
                            on:blur={(e) => handleBlur(e, participant, 'hpMax')}
                        />
                    </div>
                {:else}
                    <div class="participants-list-cell-value">{participant.hpCurrent}{participant.hpTemporary == 0 ? '' : '+' + participant.hpTemporary}/{participant.hpMax}</div>
                {/if}
                {#if participant.isEditing}
                    <input class="participants-list-cell-value" 
                        placeholder={modifier(participant.armorClass)}
                        value={calcTempValues.get(`${participant.id}-armorClass`) ?? participant.armorClass}
                        on:keydown={(e) => handleKeyPress(e, participant, 'armorClass')}
                        on:blur={(e) => handleBlur(e, participant, 'armorClass')}
                    />
                {:else}
                    <div class="participants-list-cell-value">{participant.armorClass}</div>
                {/if}
                <div class="participants-list-cell-header-value">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        width="24" height="24" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                        class="lucide lucide-eraser" 
                        on:click={() => removeParticipant(participant.id)}
                    >
                        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
                        <path d="M22 21H7"/>
                        <path d="m5 11 9 9"/>
                    </svg>
                </div>
            </div>
        {/each}
        <div class="participants-list-cell-add" on:click={addParticipant}>
            <svg xmlns="http://www.w3.org/2000/svg" 
                width="24" height="24" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                class="lucide lucide-plus"
            >
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
            </svg>
        </div>
    </div>
</div>

<style>
    .initiative-tracker {
        padding: 10px;
        min-width: 35em;
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
        grid-template-columns: 1fr 1fr;
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
