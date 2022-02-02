import { parseVar, evalVar, affecting } from "../utils/expr";
import { setClasses } from "../utils/dom";
import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-class="reference"`
 *
 * It adds a class with a value from `{@link Page.event:update}`.
 * All other existing lasses are preserved.
 */
class otClass extends DirectiveBase {
  init() {
    this.var = parseVar(this.getParam("class"));
    this.defaults = Array.from(this.elem.classList);
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      setClasses(this.elem, this.defaults);
    }
  }

  onUpdate(event,  changes) {
    if (affecting(this.var, event)) {
      let classes = this.defaults.slice();
      let val = evalVar(this.var, changes);
      if (!!val) {
        classes.push(val);
      }
      setClasses(this.elem, classes);
    }
  }
}

registerDirective("[ot-class]", otClass);
