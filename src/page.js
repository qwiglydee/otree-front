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

    this.reset();
  }

  /**
   * Binds an event handler to page
   *
   * @param {String} type type of an event
   * @param {Function} handler getting parameters (event, data)
   */
  onEvent(type, handler) {
    this.body.addEventListener(type, (ev) => handler(ev, ev.detail));
  }

  /**
   * Binds an event handler to an element
   *
   * @param {HTMLElement} elem an element
   * @param {String} type type of an event
   * @param {Function} handler getting parameters (event, data)
   */
  onElemEvent(elem, type, handler) {
    elem.addEventListener(type, (ev) => handler(ev, ev.detail));
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
   * @returns {Promise} resolved when event emitd
   */
  waitForEvent(type) {
    let target = this.body;
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
   */
  emitEvent(type, detail) {
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => this.body.dispatchEvent(new CustomEvent(type, { detail })));
  }

  /**
   * Emits an event on an element
   *
   * The event is always a `CustomEvent`.
   * To emit built-in events, use built-in `target.dispatchEvent(event)`.
   *
   * @param {HTMLElement} [target=page.body] an alternate element to emit at
   * @param {String} type type of the event
   * @param {Object} detail any data to attach to the event
   */
  emitElemEvent(elem, type, detail) {
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => elem.dispatchEvent(new CustomEvent(type, { detail })));
  }

  /**
   * Signals reset of some page vars.
   *
   * @param {string[]} [vars] list of vars being reset, by default only ['game']
   * @fires Page.reset
   */
  reset(vars) {
    if (vars !== undefined && !Array.isArray(vars)) vars = [vars];
    this.emitEvent("ot.reset", vars);
  }

  /**
   * Signals changes of some page vars 
   *
   * @param {object|Changes} changes
   * @fires Page.update
   */
  update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.emitEvent("ot.update", changes);
  }

  /**
   * Emits timeout.
   *
   * @fires Schedule.timeout
   */
  timeout(time) {
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


  /**
   * Force native inputs to emit values
   *  
   * @param {*} inpvar 
   */
  submitInputs(inpvar) {
    this.body.querySelectorAll(`[ot-input="${inpvar}"]`).forEach(inp => {
      this.emitEvent('ot.input', {name: inpvar, value: inp.value});
    })
  }

  /**
   * Force whole page to submit.
   */
  submit() {
    this.body.querySelector("form").submit();
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
