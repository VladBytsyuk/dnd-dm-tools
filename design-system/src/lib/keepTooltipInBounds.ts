const panelSelectors = ".redesigned-full-item, .full-statblock, .full-spell, .markdown-preview-view, .markdown-rendered, .view-content";

export function keepTooltipInBounds(button: HTMLElement) {
	const tooltip = button.querySelector<HTMLElement>("[role='tooltip']");
	if (!tooltip) return;

	const updatePosition = () => {
		requestAnimationFrame(() => {
			const panel = button.closest<HTMLElement>(panelSelectors)?.getBoundingClientRect();
			const minLeft = Math.max(8, (panel?.left ?? 0) + 8);
			const maxRight = Math.min(window.innerWidth - 8, (panel?.right ?? window.innerWidth) - 8);
			tooltip.style.maxWidth = `${Math.max(80, maxRight - minLeft)}px`;
			tooltip.style.setProperty("--tooltip-shift-x", "0px");

			const rect = tooltip.getBoundingClientRect();
			const shift = rect.left < minLeft
				? minLeft - rect.left
				: rect.right > maxRight
					? maxRight - rect.right
					: 0;
			tooltip.style.setProperty("--tooltip-shift-x", `${shift}px`);
		});
	};

	const resetPosition = () => tooltip.style.setProperty("--tooltip-shift-x", "0px");
	button.addEventListener("mouseenter", updatePosition);
	button.addEventListener("focusin", updatePosition);
	button.addEventListener("mouseleave", resetPosition);
	button.addEventListener("focusout", resetPosition);

	return {
		destroy() {
			button.removeEventListener("mouseenter", updatePosition);
			button.removeEventListener("focusin", updatePosition);
			button.removeEventListener("mouseleave", resetPosition);
			button.removeEventListener("focusout", resetPosition);
		},
	};
}
