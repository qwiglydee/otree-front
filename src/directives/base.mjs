import { Ref } from "../utils/changes";

/** map of selector => class */
export const registry = new Map();

/** registers a directive class */
export function registerDirective(selector, cls) {
  registry.set(selector, cls);
}


/** directive base class 
 * implement basic and stub methods
 * 
 * default implementation initializes `this.ref` from data attribute,
 * and reacts on rset/update events calling `this.reset()` and `this.update()`  
 */
export class Directive {
  /** directive name
   * like "foo" for `data-ot-foo`
   * 
   * should be redefined in derived classes 
   */  
  get name() {
    return "foo";
  }

  /** returns a value from dataset */
  param(name) {
    if (name === undefined) name = this.name; 
    return this.elem.dataset["ot" + name[0].toUpperCase() + name.slice(1).toLowerCase()];
  }

  constructor(page, elem) {
    this.page = page;
    this.elem = elem;
    this.handlers = new Map();
    this.init();
  }

  /** bind a method to an event 
   * 
   * @param eventype {String} event type
   * @param method {Function} a pure method reference, it'll be automatically called bound to `this`
   * @param target page or elem, by default - page 
  */
  on(eventype, method, target) {
    if (target === undefined || target === this.page) {
      target = this.page.body;
    }

    const handler = method.bind(this);
    const listener = this.page.on(eventype, handler, target);
    if (this.handlers.has(eventype)) this.handlers.get(eventype).off(); 
    this.handlers.set(eventype, listener);
  }

  /** unbind method from event 
   * disabled event handler previously bound by `this.on`.
   * without args unbinds all handlers
   */
  off(eventype) {
    if (eventype === undefined) {
      this.handlers.forEach((hnd, evt) => {
        hnd.off();
      })
      this.handlers.clear();
    } else {
      this.handlers.get(eventype).off();
      this.handlers.delete(eventype);
    }
  }

  /** initializes directive 
   * use to parse parameters from the element 
   */
  init() {
    this.ref = this.param(this.name);
    Ref.validate(this.ref); 
  } 

  /** sets events up 
   */
  setup() {
    this.on('otree.page.reset', this.onReset);
    this.on('otree.page.update', this.onUpdate);
  }

  onReset(event) {
    this.reset(event.detail);
  }
  
  onUpdate(event) {
    const changes = event.detail;
    if (changes.affects(this.ref)) {
      this.update(changes);
    }
  }

  reset() {
    // do something
    throw new Error("Method not implemented");
  }

  update(changes) {
    // do something
    throw new Error("Method not implemented");
  }
}




