import { writable } from "svelte/store";

export enum Theme {
    Dark, Light
}

export const theme = writable(getCurrentTheme());

export function getCurrentTheme(): Theme {
    return document.body.classList.contains('theme-dark') ? Theme.Dark : Theme.Light;
}

export function registerThemeChangeListener() {
    let currentTheme = getCurrentTheme();
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === 'class') {
                const newTheme = getCurrentTheme();
                if (newTheme !== currentTheme) {
                    currentTheme = newTheme;
                    theme.set(newTheme);
                }
            }
        }
    });
    observer.observe(document.body, { attributes: true });
}
