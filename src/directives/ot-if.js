import { parseExpr, VarExpr, CmpExpr } from "../utils/expr";
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
 * For `ot-when="var"` element shows when the `var` is defined and true.
 *
 * For `ot-when="var == val"` element shows when the `var` is defined and equal to the val.
 *
 * @hideconstructor
 */
export class otIf extends DirectiveBase {
  init() {
    this.expr = parseExpr(this.getParam("if"));
    if (!(this.expr instanceof CmpExpr || this.expr instanceof VarExpr)) {
      throw new Error("expected var reference or condition expression in ot-if");
    }

    this.onEvent("ot.reset", this.reset);
    this.onEvent("ot.update", this.update);
    this.onEvent("ot.input", this.update);
  }

  reset(event) {
    if (!this.expr.affected(event)) return;
    toggleDisplay(this.elem, false);
  }

  update(event) {
    // both ot.update and ot.input
    if (!this.expr.affected(event)) return;
    toggleDisplay(this.elem, this.expr.eval(event));
  }
}

registerDirective("[ot-if]", otIf);
