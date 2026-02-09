<script lang="ts">
	interface Props {
		name: { value: string };
		info: {
			charClass: string;
			charSubclass?: string;
			level: number;
			race: string;
			background?: string;
			playerName?: string;
			alignment?: string;
			experience?: number;
		};
		avatar?: {
			jpeg?: string;
			webp?: string;
		};
	}

	let { name, info, avatar }: Props = $props();

	const avatarUrl = $derived(avatar?.webp || avatar?.jpeg || '');
	const classDisplay = $derived(
		info.charSubclass ? `${info.charClass} (${info.charSubclass})` : info.charClass
	);
</script>

<div class="character-header">
	<div class="header-content">
		{#if avatarUrl}
			<div class="avatar-container">
				<img src={avatarUrl} alt={name.value} class="avatar-image" />
			</div>
		{/if}
		<div class="header-info">
			<h1 class="character-name">{name.value}</h1>
			<div class="character-subtitle">
				<span class="class-info">{classDisplay} {info.level}</span>
				<span class="separator">•</span>
				<span class="race-info">{info.race}</span>
			</div>
			<div class="character-details">
				{#if info.background}
					<span class="detail-item">
						<span class="detail-label">Предыстория:</span>
						<span class="detail-value">{info.background}</span>
					</span>
				{/if}
				{#if info.playerName}
					<span class="detail-item">
						<span class="detail-label">Игрок:</span>
						<span class="detail-value">{info.playerName}</span>
					</span>
				{/if}
				{#if info.alignment}
					<span class="detail-item">
						<span class="detail-label">Мировоззрение:</span>
						<span class="detail-value">{info.alignment}</span>
					</span>
				{/if}
				{#if info.experience !== undefined}
					<span class="detail-item">
						<span class="detail-label">Опыт:</span>
						<span class="detail-value">{info.experience.toLocaleString()}</span>
					</span>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.character-header {
		padding: 20px;
		background: linear-gradient(135deg, var(--background-secondary) 0%, var(--background-primary) 100%);
		border: 2px solid var(--background-modifier-border);
		border-radius: 8px;
		margin-bottom: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.avatar-container {
		flex-shrink: 0;
	}

	.avatar-image {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid var(--text-accent);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.header-info {
		flex: 1;
		min-width: 0;
	}

	.character-name {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 700;
		color: var(--text-normal);
		line-height: 1.2;
	}

	.character-subtitle {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
		font-size: 16px;
		color: var(--text-muted);
	}

	.class-info,
	.race-info {
		font-weight: 600;
	}

	.separator {
		opacity: 0.5;
	}

	.character-details {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		font-size: 13px;
	}

	.detail-item {
		display: flex;
		gap: 4px;
	}

	.detail-label {
		font-weight: 600;
		color: var(--text-muted);
	}

	.detail-value {
		color: var(--text-normal);
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			text-align: center;
		}

		.character-name {
			font-size: 24px;
		}

		.character-subtitle {
			justify-content: center;
		}

		.character-details {
			justify-content: center;
		}
	}
</style>
