import { parseVar, evalVar, affecting } from "../utils/expr";
import { setChild } from "../utils/dom";

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
    this.var = parseVar(this.getParam("img"));
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      this.replaceImg(new Image());
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      let img = evalVar(this.var, changes);
      this.replaceImg(img);
    }
  }

  replaceImg(newimg) {
    if (!!newimg && !(newimg instanceof Image)) {
      throw new Error(`Invalid value for image: ${newimg}, expecting Imge instance`);
    }
    let attrs = this.elem.attributes;
    this.elem.replaceWith(newimg);
    this.elem = newimg;

    for(let attr of attrs) {
      if (attr.name.startsWith("ot-") || attr.name == 'src') continue;
      this.elem.setAttribute(attr.name, attr.value);
    }

  }
}

registerDirective("[ot-img]", otImg);
