import { setText } from "../utils/dom";
import { Directive, registerDirective } from "./base";

class otText extends Directive {
  get name() {
    return "text";
  }

  update(changes) {
    setText(this.elem, changes.pick(this.ref)); 
  }
}

registerDirective("[data-ot-text]", otText);