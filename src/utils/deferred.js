/** Deferred
 *
 * A wrapper for a promise that you can resolve and check later, outside of closure.
 * ```
 * let dfd = new Deferred()
 * setTimeout(() => dfd.resolve(), 10000);
 * await dfd.promise; // waiting for the timeout
 * assert dfd.state === true;
 */

export class Deferred {
  constructor() {
    this.state = null;
    this.promise = new Promise((resolve, reject) => {
      this.reject = (reason) => {
        reject(reason);
        this.state = false;
      };
      this.resolve = (reason) => {
        resolve(reason);
        this.state = true;
      };
    });
  }
}