import { Changes } from "./utils/changes";

import { registry } from "./directives/base";

/** Main page.
 *
 * Centeral point of synchronization.
 *
 * Provides utils to fire and handle events.
 *
 * Installs all registered directives, found in html.
 *
 * *NB*: The installation happens only once, directives won't work in dynamically added html code.
 *
 * @property {Phase} phase set of flags indicating common state of directives, `{ display, inputEnabled }`
 */
export class Page {
  /**
   * @param {HTMLElement} [body=document.body] the element to attach all the events
   */
  constructor(body) {
    this.body = body || document.body;
    this.phase = {};
    this.init();
  }

  init() {
    let page = this;
    registry.forEach((cls, sel) => {
      this.body.querySelectorAll(sel).forEach((elem) => {
        // console.debug(cls, sel, elem);
        let inst = new cls(page, elem);
        inst.setup();
      });
    });

    this.resetPhase();
    this.emitReset();
  }

  /**
   * Binds an event handler
   *
   * @param {String} type type of an event
   * @param {Function} handler
   * @param {HTMLElement} [target=page.body] an element to bind handler, instead of the page itself
   */
  onEvent(type, handler, target) {
    (target || this.body).addEventListener(type, handler);
  }

  /**
   * Removes event hanfler
   *
   * @param {String} type type of an event
   * @param {Function} handler, previously binded to an event
   * @param {HTMLElement} [target=page.body]
   */
  offEvent(type, handler, target) {
    (target || this.body).removeEventListener(type, handler);
  }

  /**
   * Waits for an event
   *
   * Returns a promise that resolves when an event happen.
   *
   * *NB*: this doesb't catch events happened before the waiting started. For such cases you need to save the promise and await for it later.
   *
   * Example:
   *
   *    await page.waitForEvent('ot.time.out'); // suspend script until timeout emitd
   *
   *    let waiting = page.waitForEvent('ot.timeout'); // start waiting without suspending
   *    // do some work during which a timeout might happen
   *    await waiting; // suspend for an event happend since the 'waiting' created
   *
   * @param {String} type of the event
   * @param {HTMLElement} [target=page.body]
   * @returns {Promise} resolved when event emitd
   */
  waitForEvent(type, target) {
    target = target || this.body;
    return new Promise((resolve) => {
      function listener(event) {
        resolve(event);
        target.removeEventListener(type, listener);
      }
      target.addEventListener(type, listener);
    });
  }

  /**
   * Emits an event.
   *
   * The event is always a `CustomEvent`.
   * To emit built-in events, use built-in `target.dispatchEvent(event)`.
   *
   * @param {String} type type of the event
   * @param {Object} detail any data to attach to the event
   * @param {HTMLElement} [target=page.body] an alternate element to emit at
   */
  emitEvent(type, detail, target) {
    // console.debug("firing", type, detail);
    const event = new CustomEvent(type, { detail });
    target = target || this.body;
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => target.dispatchEvent(event));
  }

  /**
   * Emits page reset.
   *
   * @param {string[]} [vars] list of vars being reset, by default only ['game']
   * @fires Page.reset
   */
  emitReset(vars) {
    if (vars === undefined) {
      this.emitEvent("ot.reset", "*");
    } else {
      if (!Array.isArray(vars)) vars = [vars];
      this.emitEvent("ot.reset", vars);
    }
  }

  /**
   * Emits user input.
   *
   * @param {Strinn} name
   * @param {Strinn} value
   * @fires Page.update
   */
  emitInput(name, value) {
    this.emitEvent("ot.input", { name, value });
  }

  /**
   * Emits update.
   *
   * @param {object|Changes} changes
   * @fires Page.update
   */
  emitUpdate(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.emitEvent("ot.update", changes);
  }

  /**
   * Emits timeout.
   *
   * @fires Schedule.timeout
   */
  emitTimeout(time) {
    this.emitEvent("ot.timeout", time);
  }

  /**
   * Temporary disables inputs.
   *
   * Emits phase event, but doesn't affect current phase.
   *
   * @fires Page.phase
   */
  freezeInputs() {
    this.emitEvent("ot.phase", { inputEnabled: false, _freezing: true });
  }

  /**
   * Reenables inputs.
   *
   * Emits phase event, but doesn't affect current phase.
   * Inputs wont be reenabled, if a phase change happened and disabled inputs.
   *
   * @fires Page.phase
   */
  unfreezeInputs() {
    if (!this.phase.inputEnabled) return;
    this.emitEvent("ot.phase", { inputEnabled: true, _freezing: true });
  }

  /**
   * Switches display directives.
   *
   * Emits phase event, but doesn't affect current phase.
   *
   * @param {String} name matching `ot-display="name"`
   */
  switchDisplay(name) {
    this.emitEvent("ot.phase", { display: name, _switching: true });
  }

  /**
   * Resets page phase.
   *
   * @param {Object} [flags] some additional initial flags
   */
  resetPhase(flags) {
    let phase0 = { display: null, inputEnabled: false };
    if (flags) {
      Object.assign(phase0, flags);
    }
    this.phase = phase0;
    this.emitEvent("ot.phase", { _resetting: true, ...phase0 });
  }

  /**
   * Toggles page phase.
   *
   * The provided flags override existing, unaffected flags are preserved.
   * I.e. `togglePhase({ inputEnabled: true })` keeps current value of `display` flag.
   *
   * @param {Phase} phase set of flags to change
   * @fires Page.phase
   */
  togglePhase(phase) {
    Object.assign(this.phase, phase);
    this.emitEvent("ot.phase", phase); // NB: only changes are signalled
  }

  submit() {
    this.documentQuery("form").submit();
  }
}

/**
 * A page phase flags
 *
 * The set of fields can be extended by anything else needed for custom directives.
 *
 * @typedef {Object} Phase
 * @property {string} [display] to toggle `ot-display` directives
 * @property {bool} [inputEnabled] to enable/disable `ot-input` directives
 */

/**
 * Indicates that a user started a game pressing 'Space' or something.
 * Triggered by directive `ot-ready`
 *
 * @event Page.ready
 * @property {string} type `ot.ready`
 */

/**
 * Indicates that some page vars have been reset
 *
 * @event Page.reset
 * @property {string} type `ot.reset`
 * @property {string[]} detail list of top-level vars
 */

/**
 * Indicates that page variables has changed.
 * Used by directives to update their content.
 *
 * @event Page.update
 * @property {string} type `ot.update`
 * @property {Changes} detail changes
 */

/**
 * Indicates that a user provided some input.
 *
 * @event Page.input
 * @property {string} type `ot.input`
 * @property {object} detail an object like `{field: value}` corresponding to directive `ot-input="field=value"`
 */

/**
 * Indicates a timed phase switching display, inputEnabled, or something else
 *
 * @event Page.phase
 * @property {string} type `ot.phase`
 * @property {object} detail an object like `{display: something, inputEnabled: bool, ...}`
 */

/**
 * Indicates timeout happened.
 *
 * @event Page.timeout
 * @property {string} type `ot.timeout`
 */
