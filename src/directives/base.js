import { Ref } from "../utils/changes";

/* map of selector => class */
export const registry = new Map();

/** 
 * Registers a directive class.
 * 
 * The {@link Page} sets up all registered directives on all found elements in html.
 * The elements a searched by provided selector, which is something like `[data-ot-something]` but actually can be anything.
 * 
 * @param {string} selector a css selector for elements
 * @param {class} cls a class derived from {@link Directive}  
 */
export function registerDirective(selector, cls) {
  registry.set(selector, cls);
}

/** 
 * Base class for directives.
 * 
 * Used by all built-in directives and can be used to create custom directives.
 */
export class Directive {
  /** 
   * directive name
   * 
   * like "foo" for `data-ot-foo`
   * 
   * should be redefined in derived classes 
   */  
  get name() {
    return "foo";
  }

  /** 
   * Returns a value from dataset, corresponding to the name.
   * 
   * i.e. value of `data-ot-foo` attribute. 
   */
  param(name) {
    if (name === undefined) name = this.name; 
    return this.elem.dataset["ot" + name[0].toUpperCase() + name.slice(1).toLowerCase()];
  }

  /**
   * A directive instance is created for each matching element.
   * 
   * @param {Page} page 
   * @param {HTMLElement} elem 
   */
  constructor(page, elem) {
    this.page = page;
    this.elem = elem;
    this.handlers = new Map();
    this.init();
  }

  /** 
   * Binds an event handler.
   * 
   * Shorcut for page.on, with the handler bound to `this` directive.
   * 
   * @param {String} eventype
   * @param {Function} handler either `this.something` or a standalone function
   * @param {HTMLElement} [target=page] either the element itself or the page 
  */
  on(eventype, handler, target) {
    if (target === undefined || target === this.page) {
      target = this.page.body;
    }
    return this.page.on(eventype, handler.bind(this), target);
  }

  /** 
   * Initializes directive.
   *  
   * Use it to parse parameters from the element, and to init all the state.
   * 
   * Default implementation takes reference from corresponding attr and puts it into `this.ref`   
   */
  init() {
    this.ref = this.param(this.name);
    Ref.validate(this.ref); 
  } 

  /**
   * Sets up event handlers
   * 
   * Default implementation sets up `update` handler to check if `this.ref` is affected and to call `this.update`
   */
  setup() {
    this.on('ot.update', this.onUpdate);
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
