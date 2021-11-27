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
 * and sets up update handler  
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

  /** binds an event handler
   * 
   * Shorcut for page.on, with the handler autobound to `this` directive
   * 
   * @param eventype {String} event type
   * @param handler {Function(event, detail)} handler
   * @param target page or elem, by default - page 
  */
  on(eventype, handler, target) {
    if (target === undefined || target === this.page) {
      target = this.page.body;
    }
    return this.page.on(eventype, handler.bind(this), target);
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
    this.on('otree.page.update', this.onUpdate);
  }
  
  onUpdate(event, changes) {
    if (changes.affects(this.ref)) {
      this.update(changes);
    }
  }

  update(changes) {
    // do something
    throw new Error("Method not implemented");
  }
}
