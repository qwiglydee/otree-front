import { Ref } from "../utils/changes";
import { setAttr } from "../utils/dom";

import { Directive, registerDirective } from "./base";

class otAttrBase extends Directive {
  reset() {
    this.elem.removeAttribute(this.name);
  }

  update(changes) {
    setAttr(this.elem, this.name, changes.pick(this.ref));
  }
}

const ALLOWED_ATTRIBS = ["disabled", "hidden", "height", "width", "min", "max", "low", "high", "optimum", "value"];

// create subclass for each attr with static property
// register them as `data-ot-something`
ALLOWED_ATTRIBS.forEach(attrname => {
  class otAttr extends otAttrBase {
    get name() {
      return attrname;
    }
  };
  registerDirective(`[data-ot-${attrname}]`, otAttr);
});