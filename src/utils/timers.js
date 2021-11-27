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

/** Timers
 * A set of timers with names
 */
export class Timers {
    constructor() {
        this.timers = new Map();
    }

    delay(name, fn, timeout=0) {
        if (this.timers.has(name)) {
            cancel(this.timers.get(name));
        }
        this.timers.set(name, delay(fn, timeout));
    }

    cancel(...names) {
        if (names.length != 0) {
            names.forEach((n) => {
                cancel(this.timers.get(n))
                this.timers.delete(n);
            });
        } else {
            this.timers.forEach((v, k) => cancel(v));
            this.timers.clear();
        }
    }
}