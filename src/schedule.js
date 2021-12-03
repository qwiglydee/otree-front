import { Timers } from "./utils/timers";

/**
 * Schedule to toggle page flags at specifed time moments  
 */

export class Schedule {
  constructor(page) {
    this.page = page;
    this.timers = new Timers();
  }

  /**
   * Starts all the timers and eventualy triggers phasevents 
   *  
   * @param {Phase[]} phases 
   */
  run(phases) {
    phases.forEach((phase, i) => {
      this.timers.delay(`phase-${i}`, () => { this.page.toggle(phase) }, phase.time);
      if ("timeout" in phase) {
        this.timers.delay(`timeout`, () => { this.cancel(); this.page.timeout() }, phase.time + phase.timeout);
      }
    });  
  }

  /**
   * Cancels all pending phases 
   */
  cancel() {
    this.timers.cancel();
  }
}


/**
 * Indicates a timed phase switching display, input, or something else
 *
 * @event Schedule.phase
 * @property {string} type `ot.phase`
 * @property {object} detail an object like `{display: something, input: bool, ...}`
 */

/**
 * Indicates timeout happened.
 *
 * @event Schedule.timeout
 * @property {string} type `ot.timeout`
 */
