/** @module utils/timers */


/**
 * Async sleeping
 * 
 * @param {number} time in ms 
 * @returns {Promise}
 */
export async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

/**
 * Delays function call
 * 
 * @param {Function} fn 
 * @param {number} delay in ms 
 * @returns {*} timer_id 
 */
export function delay(fn, delay=0) {
    return window.setTimeout(fn, delay);
}

/**
 * Cancels delayed call
 * 
 * @param {*} id timer_id 
 */
export function cancel(id) {
    window.clearTimeout(id);
}

/** 
 * Timers.
 * 
 * A set of timers with names
 */
export class Timers {
    constructor() {
        this.timers = new Map();
    }

    /**
     * Delays function call
     * 
     * @param {sting} name 
     * @param {Function} fn 
     * @param {number} timeout in ms
     */
    delay(name, fn, timeout=0) {
        if (this.timers.has(name)) {
            cancel(this.timers.get(name));
        }
        this.timers.set(name, delay(fn, timeout));
    }

    /**
     * Cancels delayed calls by names.
     * 
     * @param  {...string} names one or more named calls to cancel, empty to cancel all 
     */
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