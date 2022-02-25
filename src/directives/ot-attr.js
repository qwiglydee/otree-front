import { parseExpr, VarExpr } from "../utils/expr";
import { setAttr } from "../utils/dom";
import { DirectiveBase, registerDirective } from "./base";

/**
 * Directives `ot-attr-something="reference"`
 *
 * The allowed attributes are:
 * - `height`
 * - `width`
 * - `min`
 * - `max`
 * - `low`
 * - `high`
 * - `optimum`
 * - `value`
 *
 * It deletes or sets value of the attribute to a value from {@link Page.event:update}.
 *
 * @hideconstructor
 */
class otAttrBase extends DirectiveBase {
  get name() {
    throw new Error("name getter should be defined");
  }

  init() {
    this.var = parseExpr(this.getParam(this.name));
    if (!(this.var instanceof VarExpr)) {
      throw new Error(`expected var reference expression in ot-${this.name}`);
    }

    this.onEvent("ot.reset", this.reset);
    this.onEvent("ot.update", this.update);
    this.onEvent("ot.input", this.update);
  }

  reset(event) {
    if (!this.var.affected(event)) return;
    setAttr(this.elem, this.name, null);
  }

  update(event) { // both ot.pdate and ot.input 
    if (!this.var.affected(event)) return;
    setAttr(this.elem, this.name, this.var.eval(event));
  }
}

const ALLOWED_ATTRIBS = ["height", "width", "min", "max", "low", "high", "optimum", "value"];

// create subclass for each attr with static property
// register them as `ot-something`
ALLOWED_ATTRIBS.forEach((attrname) => {
  class otAttr extends otAttrBase {
    get name() {
      return attrname;
    }
  }
  registerDirective(`[ot-${attrname}]`, otAttr);
});
