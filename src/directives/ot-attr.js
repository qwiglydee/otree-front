import { setAttr } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directives `ot-attr-something="reference"`
 * 
 * The allowed attributes are: 
 * - `disabled` 
 * - `hidden` 
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
  reset() {
    setAttr(this.elem, this.name, null);
  }

  update(changes) {
    setAttr(this.elem, this.name, changes.pick(this.ref));
  }
}

const ALLOWED_ATTRIBS = ["disabled", "hidden", "height", "width", "min", "max", "low", "high", "optimum", "value"];

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