export enum Theme {
    Dark, Light
}

export function getCurrentTheme(): Theme {
    return document.body.classList.contains('theme-dark') ? Theme.Dark : Theme.Light;
}
