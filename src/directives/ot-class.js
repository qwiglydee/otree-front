import { setClasses } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `data-ot-class="reference"`
 * 
 * It adds a class with a value from `{@link Page.event:update}`.
 * All other existing lasses are preserved. 
 */
class otClass extends DirectiveBase {
  get name() {
    return "class";
  }

  init() {
    super.init();
    this.defaults = Array.from(this.elem.classList);
  }

  reset() {
    setClasses(this.elem, this.defaults);
  }

  update(changes) {
    let classes = this.defaults.slice();
    let val = changes.pick(this.ref);
    if (!!val) {
      classes.push(val);
    }
    setClasses(this.elem, classes);
  }
}

registerDirective("[data-ot-class]", otClass);