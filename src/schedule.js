import { Timers } from "./utils/timers";

/**
 * Schedule to toggle page flags at specifed time moments
 */

export class Schedule {
  constructor(page) {
    this.page = page;
    this.timers = new Timers();
    this.phases = null;
    this.timeout = null;
  }

  /**
   * Setup schedule
   *
   * The `phases` in config is a list of {@link Phase} augmented with `time` field indicating time in ms to emit phase events.
   * ```
   * { phases: [
   *  { at: 0, display: "something", }
   *  { at: 1000, display: "somethingelse", inputEnabled: false }
   * ]}
   * ```
   *
   * The `timeout` in config is time in ms to emit timeout even t.
   *
   * @param {Object} config an object with `{ phases, timeout }`
   */
  setup(config) {
    this.phases = config.phases;
    this.timeout = config.timeout;
  }

  /**
   * Starts emitting all scheduled events
   */
  start() {
    if (this.phases) {
      this.phases.forEach((phase, i) => {
        const flags = Object.assign({}, phase);
        delete flags.at;

        this.timers.delay(
          `phase-${i}`,
          () => {
            this.page.togglePhase(flags);
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
          this.page.emitTimeout(this.timeout);
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
