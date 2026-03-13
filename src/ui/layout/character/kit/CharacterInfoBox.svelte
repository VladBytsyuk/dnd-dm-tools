<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		icon?: string;
	}

	let { label, value, icon }: Props = $props();
</script>

<div class="character-info-box">
	{#if icon}
		<span class="info-icon">{icon}</span>
	{/if}
	<div class="info-content">
		<div class="info-label">{label}</div>
		<div class="info-value">{value}</div>
	</div>
</div>

<style>
	.character-info-box {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background-color: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		margin-bottom: 8px;
	}

	.info-icon {
		font-size: 20px;
		opacity: 0.8;
	}

	.info-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.info-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		letter-spacing: 0.5px;
	}

	.info-value {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-normal);
	}
</style>
