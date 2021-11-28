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
   *    await page.wait('otree.time.out'); // suspend script until timeout fired
   *
   *    let waiting = page.wait('otree.time.out'); // start waiting without suspending
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
   * A shortcut to fire reset and update, indicating some data is deleted.
   * 
   * @param {string} [obj] alternate obj to reset (e.g. 'progress') 
   * @fires Page.reset
   * @fires Page.update
   */
  reset(obj="game") {
    this.fire("otree.page.reset", obj);
    this.fire("otree.page.update", new Changes({ [obj]: undefined }));
  }

  /** 
   * A shortcut to fire start
   *  
   * @fires Page.start
   */
  start() {
    this.fire("otree.page.start");
  }

  /** 
   * A shortcut to fire update.
   *  
   * @fires Page.update
   * @param {object|Canges} changes a plain object is autoconverted to {@link Changes} 
   */
   update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.page.update", changes);
  }

  /** 
   * A shortcut to fire update.
   * To use in input directives.
   * 
   * @fires Page.response
   * @param {object} changes a plain object indicating any fields and values  
   */
   response(changes) {
    this.fire("otree.page.response", changes);
  }

  /** 
   * A shortcut to fire phase change.
   * To use to switch phases manually without {@link Schedule} 
   * 
   * @fires Schedule.phase
   * @param {Phase} phase all the flags of the phase  
   */
   toggle(phase) {
    this.fire("otree.time.phase", phase);
  }

  /** 
   * A shortcut to fire timeout.
   * To use to enforce the timeout.
   * 
   * @fires Schedule.timeout
   */
  timeout() {
    this.fire("otree.time.out");
  }
}

/**
 * Indicates that a user started a game pressing 'Space' or something.
 *  
 * @event Page.start
 * @property {string} type `otree.page.start` 
 */

/** 
 * Indicates that a game (or something else) has been reset.
 * 
 * @event Page.reset
 * @property {string} type `otree.page.reset` 
 * @property {string} detail an object being reset, i.e. 'game' or 'progress'
 */

/** 
 * Indicates that game state is updated and directives should refresh content. 
 * 
 * @event Page.update
 * @property {string} type `otree.page.update`
 * @property {Changes} detail changes
 */

/**
 * Indicates that a user provided some input.
 * 
 * The input is a plain object indicating some fields and values, it doesn't have to match game state structure  
 * 
 * @event Page.response
 * @property {string} type `otree.page.response`
 * @property {object} detail some set of fields and values
 */
