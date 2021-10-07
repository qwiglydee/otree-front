export async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

export function delay(fn, delay=0) {
    return window.setTimeout(fn, delay);
}

export function cancel(id) {
    window.clearTimeout(id);
    return null;
}