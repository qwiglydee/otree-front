import { Timers } from "./utils/timers";

/** 
 * Scheduling of timing phases.
 * 
 * Fires events according to timing table.
 * 
 * Measures reaction time from a moment when a phases had `input: true` to a `page.response` event, using browser `performance` utility.  
 * 
 * The phases are objects of type {@link Phase}. 
 * A phase without `time` and `name` is default, which is toggled at start or `schedule.reset` 
 */
export class Schedule {

  /**
   * @param {Page} page 
   * @param {Phase[]} phases 
   */
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
    });
  }

  /**
   * Starts all the timers.
   * 
   * @fires Schedule.phase
   * @fires Schedule.timeout
   */
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

  /**
   * @param {Phase} phase the phase flags
   * @fires Schedule.phase
   */
  toggle(phase) {
    this.current = phase;
    this.page.fire("otree.time.phase", phase);
  }

  /**
   * @fires Schedule.timeout
   */
  timeout() {
    this.current = null;
    this.page.fire("otree.time.out");
    this.cancel();
  }

  /**
   * Switches to a named phase.
   * 
   * @param {string} name
   * @fires Schedule.phase 
   */
  switch(name) {
    this.toggle(this.named.get(name));
  }

  /**
   * Resets to a default phase (the one defined without `time` or `name)
   * 
   * @fires Schedule.phase
   */
  reset() {
    if (this.default) {
      this.toggle(this.default);
    }
  }

  /**
   * Cancels all scheduled timers.
   */
  cancel() {
    this._timers.cancel();
  }

  /**
   * Retrieves reaction time. 
   * 
   * In case of multiple responses the time is measured for the last response
   * 
   * @returns {number} reaction time in ms
   */
  reaction_time() {
    performance.measure("reaction_time", "input", "response");
    let m = performance.getEntriesByName("reaction_time").slice(-1);
    if (m.length == 0) return undefined;
    return m[0].duration;
  }
}

/**
 * A phase to schedule or switch manually.
 * 
 * Defines set of flags and fields indicating page state.
 * 
 * The set of fields can be extended by anything else needed for custom directives or anything. 
 * 
 * @typedef {Object} Phase
 * @property {number} [time] time in ms since start to toggle the phase
 * @property {string} [name] name of the phase to toggle it manually
 * @property {number} [timeout] number of ms since start of the phase to trigger timeout
 * @property {string} [display] display toggle for `ot-display` directives
 * @property {bool} [input] input toggle for `ot-input` directives   
 */

/**
 * Indicates that a phase has come.
 *  
 * @event Schedule.phase
 * @property {string} type `otree.time.phase` 
 * @property {Phase} detail phase
 */

/**
 * Indicates that timeout has happened.
 * 
 * @event Schedule.timeout
 * @property {string} type `otree.time.out` 
 */