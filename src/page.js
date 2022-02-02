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
 */
export class Page {
  /**
   * @param {HTMLElement} [body=document.body] the element to attach all the events
   */
  constructor(body) {
    this.body = body || document.body;
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
    if (vars !== undefined && !Array.isArray(vars)) vars = [vars];
    this.emitEvent("ot.reset", vars);
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
   * @fires Page.freezing
   */
  freezeInputs() {
    this.emitEvent("ot.freezing", true);
  }

  /**
   * Reenables inputs.
   *
   * @fires Page.freezing
   */
  unfreezeInputs() {
    this.emitEvent("ot.freezing", false);
  }

  submit() {
    this.documentQuery("form").submit();
  }

  /**
   * A handler for {@link Page.ready}
   *
   * @type {Game~onReady}
   */
  set onReady(fn) {
    this.onEvent("ot.ready", (ev) => fn());
  }

  /**
   * A handler for {@link Page.input}
   *
   * @type {Page~onInput}
   */
  set onInput(fn) {
    this.onEvent("ot.input", (ev) => fn(ev.detail.name, ev.detail.value));
  }

  /**
   * A handler for {@link Page.update}
   *
   * @type {Page~onUpdate}
   */
  set onUpdate(fn) {
    this.onEvent("ot.update", (ev) => fn(ev.detail));
  }

  /**
   * A handler for {@link Schedule.timeout}
   *
   * @type {Page~onTimeout}
   */
  set onTimeout(fn) {
    this.onEvent("ot.timeout", (ev) => fn(ev.detail));
  }
}

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
 * Indicates timeout happened.
 *
 * @event Page.timeout
 * @property {string} type `ot.timeout`
 */
