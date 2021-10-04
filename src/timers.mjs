export async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

export function delay(fn) {
    window.setTimeout(fn, 0);
}
