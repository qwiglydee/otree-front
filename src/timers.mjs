export async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

export function delay(fn, delay=0) {
    window.setTimeout(fn, delay);
}