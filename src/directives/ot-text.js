import { parseVar, evalVar, affecting } from "../utils/expr";
import { setText } from "../utils/dom";
import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-text="reference"`
 *
 * It inserts text content from {@link Page.event:update}.
 *
 * @hideconstructor
 */
class otText extends DirectiveBase {
  init() {
    this.var = parseVar(this.getParam("text"));
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      setText(this.elem, null);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      setText(this.elem, evalVar(this.var, changes));
    }
  }
}

registerDirective("[ot-text]", otText);
