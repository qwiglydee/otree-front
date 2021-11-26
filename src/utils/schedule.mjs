import { Timers } from "./timers";

/** Schedule of timing phases.
 * Fires events according to timing table.
 * Events: 'otree.time.phase' for every phase defined, 'otree.time.out' for timeout
 * Each phase:
 * - { time: number, display: string, input: bool, ...} -- a phase to happen at specified time in ms, and with given parameters
 * - { time, ..., timeout: number} -- fires timeout after defined phase
 * - { name: "name", ... } -- defines custom phase to trigger manually with .trigger("name")
 * - a phase without time -- is a default phase to reset
 */
export class Schedule {
  constructor(page, phases) {
    this.page = page;
    this._timers = new Timers();

    this.timed = null;
    this.named = null;
    this.default = null;
    this.current = null;

    this.init(phases);
    this.setup();
    this.reset();
  }

  init(phases) {
    let defaults = phases.filter((it) => !("name" in it) && !("time" in it));
    if (defaults.length > 1) throw new Error("Duplicated default phases");
    if (defaults.length == 1) this.default = defaults[0];

    let named = phases.filter((it) => "name" in it),
      names = new Set(named.map((it) => it.name));
    if (named.length != names.size) throw new Error("Duplicated named phases");

    this.named = new Map(named.map((it) => [it.name, it]));

    this.timed = phases.filter((it) => "time" in it);

    if (phases.filter((it) => "timeout" in it).length > 1)
      throw new Error("Multiple timeouts in phases");
    if (phases.filter((it) => it.input === true).length > 1)
      throw new Error("Multiple input phases not supported");
  }

  setup() {
    this.page.on("otree.time.phase", (event) => {
      if (event.detail.input) {
        performance.mark("input");
      }
    });

    this.page.on("otree.page.response", () => {
      performance.mark("response");
      performance.measure("reaction_time", "input", "response");
    });
  }

  run() {
    performance.clearMeasures();
    performance.clearMarks();

    this.timed.forEach((phase, i) => {
      this._timers.delay(`phase-${i}`, () => this.toggle(phase), phase.time);
      if ("timeout" in phase) {
        this._timers.delay(`timeout`, () => this.timeout(), phase.time + phase.timeout);
      }
    });
  }

  toggle(phase) {
    this.current = phase;
    this.page.fire("otree.time.phase", phase);
  }

  timeout() {
    this.current = null;
    this.page.fire("otree.time.out");
    this.cancel();
  }

  switch(name) {
    this.toggle(this.named.get(name));
  }

  reset() {
    if (this.default) {
      this.toggle(this.default);
    }
  }

  cancel() {
    this._timers.cancel();
  }

  reaction_time() {
    let m = performance.getEntriesByName("reaction_time").slice(-1);
    if (m.length == 0) return undefined;
    return m[0].duration;
  }
}
