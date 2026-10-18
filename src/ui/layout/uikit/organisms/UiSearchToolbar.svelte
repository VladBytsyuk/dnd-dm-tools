<script lang="ts">
	import { Check, ChevronLeft, ClipboardPaste, Copy, Eraser, Pencil, Play, Plus, SlidersHorizontal, Star, Trash2, X } from "lucide-svelte";
	import { Debouncer, DEFAULT_DEBOUNCER_DELAY } from "../../../debouncer";
	import { onDestroy } from "svelte";
	import { SearchBar, type SearchBarAction } from "@dnd-dm-tools/design-system";
	import { theme as appTheme, Theme } from "src/ui/theme";

	interface Props {
		onbackclick?: () => void;
		onvaluechange?: (value: string) => void;
		isvaluechangable?: () => boolean;
		onclearclick?: () => void;
		onfiltersclick?: () => void;
		onaddclick?: () => void;
		oneditclick?: () => void;
		onplayclick?: () => void;
		playDisabled?: boolean;
		oncopyclick?: () => void;
		onpasteclick?: () => void;
		ondeleteclick?: () => void;
		onsaveclick?: () => void;
		oncancelclick?: () => void;
		onfavoriteclick?: () => void;
		isfavorite?: boolean;
		favoriteBusy?: boolean;
		actionBusy?: boolean;
	}

	let { onbackclick, onvaluechange, isvaluechangable, onclearclick, onfiltersclick, onaddclick, oneditclick, onplayclick, playDisabled = false, oncopyclick, onpasteclick, ondeleteclick, onsaveclick, oncancelclick, onfavoriteclick, isfavorite = false, favoriteBusy = false, actionBusy = false }: Props = $props();

	let searchValue = $state("");
	const dsTheme = $derived($appTheme === Theme.Dark ? "dark" : "light");
	const searchActions = $derived.by<SearchBarAction[]>(() => {
		const result: SearchBarAction[] = onfavoriteclick ? [{ icon: Star, label: isfavorite ? "Убрать из избранного" : "Добавить в избранное", favorite: isfavorite, disabled: favoriteBusy, onclick: onfavoriteclick }] : [];
		if (onplayclick) result.push({ icon: Play, label: "Воспроизвести", disabled: playDisabled || actionBusy, onclick: onplayclick });
		if (oncopyclick) result.push({ icon: Copy, label: "Копировать в буфер обмена", onclick: oncopyclick });
		if (onpasteclick) result.push({ icon: ClipboardPaste, label: "Вставить", disabled: actionBusy, onclick: onpasteclick });
		if (ondeleteclick) result.push({ icon: Trash2, label: "Удалить", onclick: ondeleteclick });
		if (onsaveclick && oncancelclick) return [...result,
			{ icon: X, label: "Отмена", disabled: actionBusy, onclick: oncancelclick },
			{ icon: Check, label: "Сохранить", disabled: actionBusy, onclick: onsaveclick },
		];
		if (oneditclick) return [...result, { icon: Pencil, label: "Редактировать", onclick: oneditclick }];
		if (!oncopyclick) result.push({ icon: Eraser, label: "Очистить поиск", disabled: Boolean(isvaluechangable && !isvaluechangable()), onclick: onClearClick });
		if (onfiltersclick) result.push({ icon: SlidersHorizontal, label: "Фильтры", onclick: onfiltersclick });
		if (onaddclick) result.push({ icon: Plus, label: "Добавить", onclick: onaddclick });
		return result;
	});

	let debouncer = new Debouncer(DEFAULT_DEBOUNCER_DELAY, async (value: string) => {
		onvaluechange?.(value);
	});

	onDestroy(() => debouncer.cancel());

	function onClearClick() {
		debouncer.cancel();
		searchValue = "";
		onvaluechange?.("");
		onclearclick?.();
	}
</script>

<SearchBar
	bind:value={searchValue}
	placeholder="Поиск в справочнике"
	aria-label="Поиск в справочнике"
	disabled={isvaluechangable && !isvaluechangable()}
	oninput={() => debouncer.debounce(searchValue)}
	leadingAction={onbackclick ? { icon: ChevronLeft, label: "Назад", onclick: onbackclick } : undefined}
	actions={searchActions}
	theme={dsTheme}
/>
