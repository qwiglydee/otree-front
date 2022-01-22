import { setText } from "../utils/dom";
import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `data-ot-text="reference"`
 * 
 * It inserts text content from {@link Page.event:update}.
 * 
 * @hideconstructor
 */
class otText extends DirectiveBase {
  get name() {
    return "text";
  }

  reset() {
    setText(this.elem, null);
  }

  update(changes) {
    setText(this.elem, changes.pick(this.ref)); 
  }
}

registerDirective("[data-ot-text]", otText);