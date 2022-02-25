import { parseExpr, VarExpr } from "../utils/expr";
import { setText } from "../utils/dom";
import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-text="reference"`
 *
 * It inserts text content from {@link Page.event:update}.
 *
 * @hideconstructor
 */
export class otText extends DirectiveBase {
  init() {
    this.enablable = this.hasParam("enabled"); // controlled by ot-enabled directive

    this.var = parseExpr(this.getParam("text"));
    if (!(this.var instanceof VarExpr)) {
      throw new Error("expected var reference expression in ot-text");
    }

    this.onEvent("ot.reset", this.reset);
    this.onEvent("ot.update", this.update);
    this.onEvent("ot.input", this.update);
  }

  reset(event) {
    if (!this.var.affected(event)) return;
    setText(this.elem, null);
  }

  update(event) {
    // both ot.update and ot.input
    if (!this.var.affected(event)) return;
    setText(this.elem, this.var.eval(event));
  }
}

registerDirective("[ot-text]", otText);
