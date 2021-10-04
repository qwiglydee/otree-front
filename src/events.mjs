export function otreeEvent(type, details) {
    return new CustomEvent(`otree-${type}`, {bubbles: false, detail: details});
}

export function otreeEventBubble(type, details) {
    return new CustomEvent(`otree-${type}`, {bubbles: true, detail: details});
}
