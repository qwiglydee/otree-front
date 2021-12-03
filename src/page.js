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
  }

  /**
   * Binds an event handler
   *
   * @param {String} type of an event
   * @param {function(event, detail)} handler
   * @param {HTMLElement} [target=page.body] an element to bind handler, instead of the page itself
   * @returns {Function} handler wrapper bound to events, the wrapper has method off() to unbind itself
   */
  on(type, handler, target) {
    target = target || this.body;
    const listener = (event) => handler(event, event.detail);
    listener.off = () => target.removeEventListener(type, listener);
    target.addEventListener(type, listener);
    return listener;
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
   *    await page.wait('ot.time.out'); // suspend script until timeout fired
   *
   *    let waiting = page.wait('ot.timeout'); // start waiting without suspending
   *    // do some work during which a timeout might happen
   *    await waiting; // suspend for an event happend since the 'waiting' created
   *
   * @param {String} type of the event
   * @returns {Promise} resolved when event fired
   */
  wait(type, target) {
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
   * Fires an event
   *
   * @param {String} type type of the event
   * @param {Object} detail any data to attach to the event
   * @param {HTMLElement} [target=page.body] an alternate element to fire at
   */
  fire(type, detail, target) {
    // console.debug("firing", type, detail);
    const event = new CustomEvent(type, { detail });
    target = target || this.body;
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => target.dispatchEvent(event));
  }

  /**
   * Triggers reset and page update.
   *
   * @param {string} [obj='game'] obj to reset (e.g. 'progress')
   * @fires Page.reset
   * @fires Page.update
   */
  reset(obj = "game") {
    this.fire("ot.reset", obj);
    this.fire("ot.update", new Changes({ [obj]: undefined }));
  }

  /**
   * Signals user input.
   *
   * @param {object} data
   * @fires Page.update
   */
  input(data) {
    this.fire("ot.input", data);
  }

  /**
   * Triggers updates on directives.
   *
   * @param {object|Canges} changes
   * @fires Page.update
   */
  update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("ot.update", changes);
  }

  /**
   * Triggers phase change.
   *
   * @param {Phase} phase all the flags of the phase
   * @fires Schedule.phase
   */
  toggle(phase) {
    this.fire("ot.phase", phase);
  }

  /**
   * Triggers timeout.
   *
   * @fires Schedule.timeout
   */
  timeout() {
    this.fire("ot.timeout");
  }

  /**
   * Disables inputs.
   *
   * (Overrides input flag from recent phase.)
   *
   * @fires Schedule.phase
   */
  freeze() {
    // FIXME: this interferes with actual time phases
    this.toggle({ input: false });
  }

  /**
   * Enables inputs.
   *
   * (Overrides input flag from recent phase.)
   *
   * @fires Schedule.phase
   */
  unfreeze() {
    // FIXME: this interferes with actual time phases
    this.toggle({ input: true });
  }
}

/**
 * Indicates that a user started a game pressing 'Space' or something.
 * Triggered by directive `ot-start`
 *
 * @event Page.ready
 * @property {string} type `ot.ready`
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
