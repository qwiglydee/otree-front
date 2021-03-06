/* map of selector => class */
export const registry = new Map();

/**
 * Registers a directive class.
 *
 * The {@link Page} sets up all registered directives on all found elements in html.
 * The elements a searched by provided selector, which is something like `[ot-something]` but actually can be anything.
 *
 * @param {string} selector a css selector for elements
 * @param {class} cls a class derived from {@link DirectiveBase}
 */
export function registerDirective(selector, cls) {
  registry.set(selector, cls);
}

/**
 * Base class for directives.
 *
 * Used by all built-in directives and can be used to create custom directives.
 */
export class DirectiveBase {
  /**
   * Returns a value from attribute `ot-name`.
   *
   * @param {string} name the param to get
   */
  getParam(attr) {
    return this.elem.getAttribute(`ot-${attr}`);
  }

  hasParam(attr) {
    return this.elem.hasAttribute(`ot-${attr}`);
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
    this.init();
  }

  /**
   * Initializes directive.
   * Used in derived classes. 
   */
  init() {}

  /**
   * Binds an event handler for a global page event
   *
   * @param {String} eventype
   * @param {Function} handler either `this.something` or a standalone function
   */
  onEvent(eventype, handler) {
    this.page.onEvent(eventype, handler.bind(this));
  }

  /**
   * Binds an event handler for a element event
   *
   * @param {String} eventype
   * @param {Function} handler either `this.something` or a standalone function
   */
  onElemEvent(eventype, handler) {
    this.page.onElemEvent(this.elem, eventype, handler.bind(this));
  }
}
