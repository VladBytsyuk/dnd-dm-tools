<script>
    let participants = [];
    let newName = '';
    let newInit = '';
    
    function addParticipant() {
        if (!newName || !newInit) return;
        
        participants = [
            ...participants,
            {name: newName, initiative: parseInt(newInit), id: Date.now()}
        ].sort((a, b) => b.initiative - a.initiative);
        
        newName = '';
        newInit = '';
    }
    
    function removeParticipant(id) {
        participants = participants.filter(p => p.id !== id);
    }
</script>

<div class="initiative-tracker">
    <div class="add-participant">
        <input type="text" bind:value={newName} placeholder="Name" />
        <input type="number" bind:value={newInit} placeholder="Initiative" />
        <button on:click={addParticipant}>Add</button>
    </div>

    <div class="participants-list">
        {#each participants as participant (participant.id)}
            <div class="participant">
                <span>{participant.name}</span>
                <span>{participant.initiative}</span>
                <button on:click={() => removeParticipant(participant.id)}>×</button>
            </div>
        {/each}
    </div>
</div>

<style>
    .initiative-tracker {
        padding: 10px;
    }
    
    .add-participant {
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
    }
    
    .participant {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        border-bottom: 1px solid var(--background-modifier-border);
    }
</style>
