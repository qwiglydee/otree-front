import { parseCond, evalCond, affecting } from "../utils/expr";
import { toggleDisplay } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-when="var"`, `ot-when="var==val", ot-when="var===val"`.
 *
 * It shows/hides host element on {@link Page.event:update}.
 *
 * The `var` is a page var reference like `game.feedback`, the `val` is a primitive json expression
 * like "true" (boolean), "42" (number), "'foo'" (string).
 *
 * For `ot-when="var"` element shows when the `var` is defined.
 *
 * For `ot-when="var==val"` element shows when the `var` is defined and equal to the val.
 *
 * For `ot-when="var===val"` element shows when the `var` is defined and strictly equal to the val.
 *
 * @hideconstructor
 */
export class otIf extends DirectiveBase {
  init() {
    this.cond = parseCond(this.getParam("if"));
  }

  onReset(event) {
    if (affecting(this.cond, event)) {
      toggleDisplay(this.elem, false);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.cond, event)) {
      toggleDisplay(this.elem, evalCond(this.cond, changes));
    }
  }
}

registerDirective("[ot-if]", otIf);
