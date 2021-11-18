import { Timers } from "./timers";
import { firePage } from "./events";

/** Schedule of timing phases.
 * Fires events according to timing table.
 * Events: 'otree.phase' for every phase defined, 'ot.timeout' for timeout
 * Each phase:
 * - { time: number, display: string, input: bool, ...} -- a phase to happen at specified time in ms, and with given parameters
 * - { time, ..., timeout: number} -- fires timeout after defined phase
 */
export class Schedule {
  constructor(phases) {
    this.phases = phases;

    let timeout_phase = phases.filter(item => 'timeout' in item);
    if (timeout_phase.length > 1) throw new Error("More than one timeouts in phases");

    this._timers = new Timers();
  }

  run(page) {
    this.phases.forEach((phase, i) => {
      this._timers.delay(`phase-${i}`, () => firePage(page, 'otree.phase', phase), phase.time);
      if ('timeout' in phase) {
        this._timers.delay(`timeout`, () => {
          firePage(page, 'otree.timeout');
          this._timers.cancel();
        }, phase.time + phase.timeout);
      }
    });
  }

  cancel() {
    this._timers.cancel();
  }
}