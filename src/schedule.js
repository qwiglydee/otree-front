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