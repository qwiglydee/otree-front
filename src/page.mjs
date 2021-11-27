import { Changes } from "./utils/changes";

import { registry } from "./directives/base";

export class Page {
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

  /** binds event handler
   *
   * @param type {String} event type
   * @param handler {function(event, detail)} a handler
   * @param target {?HTMLElement} an element to bind handler, instead of the page itself
   * @returns {Function} handler wrapper bound to events,
   *   the wrapper has method off() to unbind itself
   */
  on(type, handler, target) {
    target = target || this.body;
    const listener = (event) => handler(event, event.detail);
    listener.off = () => target.removeEventListener(type, listener);
    target.addEventListener(type, listener);
    return listener;
  }

  /** waits for an event
   *
   * Note: this doesb't catch events happened before the waiting started.
   *
   * Example 1:
   *
   *    await page.waitEvent('otree.time.out'); // suspend script until timeout fired
   *
   * Example 2:
   *
   *    const waiting = page.waitEvent('otree.time.out'); // start waiting without suspending
   *    // do something
   *    await waiting; // suspend for an event happend since the 'waiting' created
   *
   * @param type {String} event type
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

  /** fire an event
   * @param type {String} event type
   * @param detail {Object} any data to pass to handler
   * @param target {?HTMLElement} an element to fire at, instead of the page itself
   */
  fire(type, detail, target) {
    // console.debug("firing", type, detail);
    const event = new CustomEvent(type, { detail });
    target = target || this.body;
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => target.dispatchEvent(event));
  }

  reset(obj="game") {
    this.fire("otree.page.reset", obj);
    this.fire("otree.page.update", new Changes({ [obj]: undefined }));
  }

  start() {
    this.fire("otree.page.start");
  }

  update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.page.update", changes);
  }

  response(changes) {
    this.fire("otree.page.response", changes);
  }

  toggle(phase) {
    this.fire("otree.time.phase", phase);
  }

  timeout() {
    this.fire("otree.time.out");
  }
}