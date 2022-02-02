import { parseVar, evalVar, affecting } from "../utils/expr";
import { setChild } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-img="reference"`
 *
 * It inserts image element from {@link Page.event:update} inside its host.
 * The value in the Changes should be an instance of created and pre-loaded Image element.
 *
 * @hideconstructor
 */
export class otImg extends DirectiveBase {
  init() {
    this.var = parseVar(this.getParam("img"));
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      setChild(this.elem, null);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      let img = evalVar(this.var, changes);
      if (!!img && !(img instanceof Image)) {
        throw new Error(`Invalid value for image: ${img}`);
      }
      setChild(this.elem, img);
    }
  }
}

registerDirective("[ot-img]", otImg);
