import { Timers } from "./utils/timers";

/**
 * Schedule to toggle page flags at specifed time moments
 */

export class Schedule {
  constructor(page) {
    this.page = page;
    this.timers = new Timers();
    this.phases = [];
    this.timeout = null;
  }

  /**
   * Setup schedule
   *
   * The `phases` is a list of vars augmented with `at` field indicating time in ms to update the vars.
   * ```
   * [
   *  { at: 0, phase: "something", ... }
   *  { at: 1000, foo: "Foo", ... }
   * }
   * ```
   *
   * The `timeout` in config is time in ms to emit timeout even t.
   *
   * @param {Object} phases list of phases
   */
  setup(phases) {
    this.phases = phases;
  }

  at(time, vars) {
    this.phases.push({ at: time, ...vars})
  }

  setTimeout(time) {
    this.timeout = time;
  }

  /**
   * Starts emitting all scheduled events
   */
  start() {
    if (this.phases) {
      this.phases.forEach((phase, i) => {
        let vars = Object.assign({}, phase);
        delete vars.at;

        this.timers.delay(
          `phase-${i}`,
          () => {
            this.page.update(vars);
          },
          phase.at
        );
      });
    }

    if (this.timeout) {
      this.timers.delay(
        `timeout`,
        () => {
          this.stop();
          this.page.timeout(this.timeout);
        },
        this.timeout
      );
    }
  }

  /**
   * Stops emitting scheduled events
   */
  stop() {
    this.timers.cancel();
  }
}
