import { Timers } from "./timers";

/** Schedule of timing phases.
 * Fires events according to timing table.
 * Events: 'otree.page.phase' for every phase defined, 'ot.timeout' for timeout
 * Each phase:
 * - { time: number, display: string, input: bool, ...} -- a phase to happen at specified time in ms, and with given parameters
 * - { time, ..., timeout: number} -- fires timeout after defined phase
 * - { name: "name", ... } -- defines custom phase to trigger manually with .trigger("name")
 */
export class Schedule {
  constructor(page, phases) {
    this.page = page;

    this.validate(phases);
    this.phases = phases;

    this._timers = new Timers();

    this.init();
  }

  validate(phases) {
    if (phases.filter(it => 'timeout' in it).length > 1) throw new Error("Multiple timeouts in phases");
    if (phases.filter(it => it.input === true).length > 1) throw new Error("Multiple input phases not supported");
    let named = phases.filter(it => 'name' in it);
    let names = new Set(named.map(it => it.name));
    if (named.length != names.size) throw new Error("Duplicated phase names");
  } 

  init() {
    this.page.on('otree.page.phase', (event) => {
      if (event.detail.input) {
        performance.mark('input');
      }
    })
    this.page.on('otree.page.response', () => {
      performance.mark('response');
      performance.measure('reaction_time', 'input', 'response');
    })
  }

  run() {
    performance.clearMeasures();
    performance.clearMarks();
    this.phases.forEach((phase, i) => {
      this._timers.delay(`phase-${i}`, () => this.page.fire('otree.page.phase', phase), phase.time);
      if ('timeout' in phase) {
        this._timers.delay(`timeout`, () => {
          this.page.fire('otree.page.timeout');
          this._timers.cancel();
        }, phase.time + phase.timeout);
      }
    });
  }

  trigger(name) {
    let m = this.phases.filter(item => item.name == name);
    if (m.length == 0) throw new Error(`Phase ${name} not defined`);
    let phase = m[0];
    this.page.fire('otree.page.phase', phase);
  }

  cancel() {
    this._timers.cancel();
  }

  reaction_time() {
    let m = performance.getEntriesByName('reaction_time').slice(-1);
    if (m.length == 0) return undefined;
    return m[0].duration;
  }
}