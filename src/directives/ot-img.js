import { parseExpr, VarExpr } from "../utils/expr";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-img="reference"`
 *
 * It replaces host element with an element from referenced var.
 * The var should have value of preloaded Image instance.
 *
 * @hideconstructor
 */
export class otImg extends DirectiveBase {
  init() {
    this.orig = this.elem;
    this.var = parseExpr(this.getParam("img"));
    if (!(this.var instanceof VarExpr)) {
      throw new Error("expected var reference expression in ot-text");
    }

    this.onEvent("ot.reset", this.reset);
    this.onEvent("ot.update", this.update);
  }

  reset(event) {
    if (!this.var.affected(event)) return;
    this.elem.replaceWith(this.orig);
    this.elem = this.orig;
  }

  update(event) {
    if (!this.var.affected(event)) return;
    this.replaceImg(this.var.eval(event));
  }

  replaceImg(newimg) {
    if (!!newimg && !(newimg instanceof Image)) {
      throw new Error(`Invalid value for image: ${newimg}, expecting Imge instance`);
    }
    this.elem.replaceWith(newimg);
    this.elem = newimg;

    for (let attr of this.orig.attributes) {
      if (attr.name.startsWith("ot-") || attr.name == "src") continue;
      this.elem.setAttribute(attr.name, attr.value);
    }
  }
}

registerDirective("[ot-img]", otImg);
