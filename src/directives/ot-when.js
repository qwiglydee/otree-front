import { Ref } from "../utils/changes";
import { toggleDisplay } from "../utils/dom";

import { Directive, registerDirective } from "./base";

/**
 * Directive `data-ot-when="reference"` and `data-ot-when="reference==value"`.
 * 
 * It shows host element by {@link Page.event:update}, when referenced field is defined, true-like or matches specified value.
 * 
 * @hideconstructor
 */
class otWhen extends Directive {
  get name() {
    return "when";
  }

  init() {
    const when = this.param();
    const match = when.match(/^([\w.]+)(==(.+))?$/);
    if (!match) throw new Error(`Invalid expression for when: ${when}`);
    
    this.ref = match[1];
    Ref.validate(this.ref);
    
    this.cond = match[3];
    if (this.cond === "true") this.cond = true;
    if (this.cond === "false") this.cond = false; 
  }

  update(changes) {
    let value = changes.pick(this.ref);
    console.debug("ot-when", this.ref, this.cond, value);
    // for ot-when="fld" -- any true-like
    // for ot-when="fld=val" -- any non-strict equivalent
    let toggle = (this.cond !== undefined) ? value == this.cond : !!value;  

    toggleDisplay(this.elem, toggle);
  }
}

registerDirective("[data-ot-when]", otWhen);