import { Changes } from "./utils/changes";

import { registry } from "./directives/base";

export class Page {
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
  }

  /** adds event handler
   *
   * @param type {String} event type
   * @param handler {function(page, conf, event)} handler
   * @param target {?HTMLElement} an element to bind handler, instead of the page itself
   * @returns {Function} handler wrapper bound to events,
   *   the wrapper has method off() to unbind itself
   */
  on(type, handler, target) {
    target = target || this.body;
    const listener = (event) => handler(event, this, target);
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
    let hnd;
    return new Promise((resolve) => {
      hnd = this.on(
        type,
        (event) => {
          hnd.off();
          resolve(event);
        },
        target
      );
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

  /**** shortcuts */

  reset() {
    this.phase = {};
    this.fire("otree.page.reset");
  }

  start() {
    this.fire("otree.page.start");
  }

  status(data) {
    this.fire("otree.page.status", data);
    // convert status object `{ foo: val }` to changes of form `{ 'status.foo': val }`
    const changes = new Map(
      [...Object.entries(data)].map(([k, v]) => ["status." + k, v])
    );
    this.fire("otree.page.update", changes);
  }

  update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.page.update", changes);
  }

  response(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.page.response", changes);
  }

  error(code, message) {
    if (code == null) {
      this.fire("otree.page.error");
      this.fire("otree.page.update", { error: undefined });
    } else {
      let error = { code, message };
      if (!message) delete error.message;
      this.fire("otree.page.error", error);
      this.fire("otree.page.update", { error });
    }
  }

  toggle(phase) {
    this.phase = phase;
    this.fire("otree.time.phase", phase);
  }

  timeout() {
    this.fire("otree.time.out");
  }
}

/** Live Page
 * handles live messages
 * converts incoming and outgoing messages to events like `otree.live.type`
 */
export class LivePage extends Page {
  init() {
    super.init();
    window.liveRecv = this.recv.bind(this);
  }

  recv(data) {
    const type = data.type;
    delete data.type;
    this.fire(`otree.live.${type}`, data);
  }

  send(type, message) {
    const data = Object.assign({ type }, message);
    window.liveSend(data);
    this.fire(`otree.live.${type}`, message);
  }
}
