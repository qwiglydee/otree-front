import { Timers } from "./utils/timers";

export class Schedule {
  constructor(page) {
    this.page = page;
    this.timers = new Timers();
  }

  run(phases) {
    phases.forEach((phase, i) => {
      this.timers.delay(`phase-${i}`, () => { this.page.toggle(phase) }, phase.time);
      if ("timeout" in phase) {
        this.timers.delay(`timeout`, () => { this.cancel(); this.page.timeout() }, phase.time + phase.timeout);
      }
    });  
  }

  cancel() {
    this.timers.cancel();
  }
}