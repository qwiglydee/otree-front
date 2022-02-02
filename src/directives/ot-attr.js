import { parseVar, evalVar, affecting } from "../utils/expr";
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
    this.var = parseVar(this.getParam(this.name));
  }

  onReset(event,  vars) {
    if (affecting(this.var, event)) {
      setAttr(this.elem, this.name, null);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      setAttr(this.elem, this.name, evalVar(this.var, changes));
    }
  }
}

const ALLOWED_ATTRIBS = ["height", "width", "min", "max", "low", "high", "optimum", "value"];

// create subclass for each attr with static property
// register them as `ot-something`
ALLOWED_ATTRIBS.forEach(attrname => {
  class otAttr extends otAttrBase {
    get name() {
      return attrname;
    }
  };
  registerDirective(`[ot-${attrname}]`, otAttr);
});