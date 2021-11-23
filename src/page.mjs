import { Changes } from "./utils/changes";

import { otText } from "./directives/ot-text";
import { otClass } from "./directives/ot-class";
import { otImg } from "./directives/ot-img";
import { otAttr } from "./directives/ot-attr";
import { otWhen } from "./directives/ot-when";
import { otDisplay } from "./directives/ot-display";
import { otInput } from "./directives/ot-input";
import { otStart } from "./directives/ot-start";

export class Page {
  constructor(body) {
    this.body = body || document.body;
    this.phase = {};
    this.init();
  }

  init() {
    otText(this);
    otClass(this);
    otImg(this);
    otAttr(this);
    otWhen(this);
    otDisplay(this);
    otInput(this);
    otStart(this);
  }

  /** adds event handler
   *
   * @param type {String} event type
   * @param handler {function(page, conf, event)} handler
   * @param target {?HTMLElement} an element to bind handler, instead of the page itself
   * @param conf {Object} event-independent config, at least `page` required
   * @returns {Object} handler wrapper {conf, type, listener}
   */
  on(type, handler, conf, target) {
    const listener = (event) => handler(this, conf, event);
    target = target || this.body;
    target.addEventListener(type, listener);
    return { type, listener, target };
  }

  /** removes event handler
   *
   * @param wrapper a wrapper returned by `onPage`
   */
  off(wrapper) {
    wrapper.target.removeEventListener(wrapper.type, wrapper.listener);
  }

  /** waits for an event
   *
   * Note: this doesb't catch events happened before the waiting started.
   *
   * Example 1:
   *
   *    await page.waitEvent('otree.timeout'); // suspend script until timeout fired
   *
   * Example 2:
   *
   *    const waiting = page.waitEvent('otree.timeout'); // start waiting without suspending
   *    // do something
   *    await waiting; // suspend for an event happend since the 'waiting' created
   *
   * @param type {String} event type
   * @returns {Promise} resolved when event fired
   */
  wait(type) {
    let hnd;
    return new Promise((resolve) => {
      hnd = this.on(type, (event) => {
        this.off(hnd);
        resolve(event);
      });
    });
  }

  /** fire an event 
   * @param type {String} event type
   * @param detail {Object} any data to pass to handler
   * @param target {?HTMLElement} an element to fire at, instead of the page itself
   */
  fire(type, detail, target) {
    const event = new CustomEvent(type, {detail});
    target = target || this.body;
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => target.dispatchEvent(event));  
  }

  /**** shortcuts */

  reset() {
    this.phase = {};
    this.fire("otree.reset");
  }

  start() {
    this.fire("otree.start");
  }

  status(data) {
    this.fire("otree.status", data);
    // convert status object `{ foo: val }` to changes of form `{ 'status.foo': val }`
    const changes = new Map([...Object.entries(data)].map(([k, v]) => ["status." + k, v]));
    this.fire("otree.update", changes);
  }

  update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.update", changes);
  }

  response(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.response", changes);
  }

  error(code, message) {
    if (code == null) {
      this.fire("otree.error");
      this.fire("otree.update", { error: undefined });
    } else {
      let error = { code, message };
      if (!message) delete error.message;
      this.fire("otree.error", error);
      this.fire("otree.update", { error });
    }
  }

  toggle(phase) {
    this.phase = phase;
    this.fire("otree.phase", phase);
  }

  timeout() {
    this.fire("otree.timeout");
  }
}
