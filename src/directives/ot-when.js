import { Ref } from "../utils/changes";
import { toggleDisplay } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `data-ot-when="var"`, `data-ot-when="var==val", data-ot-when="var===val"`.
 *
 * It shows/hides host element on {@link Page.event:update}. 
 * 
 * The `var` is a page var reference like `game.feedback`, the `val` is a primitive json expression 
 * like "true" (boolean), "42" (number), "'foo'" (string). 
 * 
 * For `data-ot-when="var"` element shows when the `var` is defined.
 * 
 * For `data-ot-when="var==val"` element shows when the `var` is defined and equal to the val.
 * 
 * For `data-ot-when="var===val"` element shows when the `var` is defined and strictly equal to the val.
 * 
 * @hideconstructor
 */
class otWhen extends DirectiveBase {
  get name() {
    return "when";
  }

  init() {
    const when = this.param();
    const match = when.match(/^([\w.]+)((===?)(.+))?$/);
    if (!match) throw new Error(`Invalid expression for when: ${when}`);
    
    const [_0, ref, _2, eq, rhs] = match;

    Ref.validate(ref);
    this.ref = ref;
    
    let val = rhs ? JSON.parse(rhs.replaceAll("'", '"')) : null;

    if (eq == '==') {
      this.check = (v) => (v !== undefined) && v == val;
    } else if (eq == '===') {
      this.check = (v) => (v !== undefined) && v === val;
    } else {
      this.check = (v) => (v !== undefined);
    }
  }

  reset() {
    toggleDisplay(this.elem, false);
  }

  update(changes) {
    let value = changes.pick(this.ref);
    let toggle = this.check(value);

    toggleDisplay(this.elem, toggle);
  }
}

registerDirective("[data-ot-when]", otWhen);