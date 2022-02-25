import { parseExpr, VarExpr } from "../utils/expr";
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
    this.defaults = Array.from(this.elem.classList);
    this.var = parseExpr(this.getParam("class"));
    if (!(this.var instanceof VarExpr)) {
      throw new Error("expected var reference expression in ot-class");
    }

    this.onEvent("ot.reset", this.reset);
    this.onEvent("ot.update", this.update);
    this.onEvent("ot.input", this.update);
  }

  reset(event) {
    if (!this.var.affected(event)) return;
    setClasses(this.elem, this.defaults);
  }

  update(event) {
    // both ot.update and ot.input
    if (!this.var.affected(event)) return;
    let classes = this.defaults.slice();
    let val = this.var.eval(event);
    if (!!val) {
      classes.push(val);
    }
    setClasses(this.elem, classes);
  }
}

registerDirective("[ot-class]", otClass);
