import { Timers } from "./utils/timers";

/**
 * Schedule to toggle page flags at specifed time moments
 * 
 * @property {Array} phases list of phases as `{ at: msecodds, var: val, ...}`
 * @property {number} timeout number of mseconds to emit timeout 
 */

export class Schedule {
  constructor(page) {
    this.page = page;
    this.timers = new Timers();
    this.phases = [];
    this.timeout = null;

    this.page.onEvent("ot.trial.started", () => this.start());
    this.page.onEvent("ot.trial.completed", () => this.stop());
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
