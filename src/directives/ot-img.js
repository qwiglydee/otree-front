import { setChild } from "../utils/dom";

import { Directive, registerDirective } from "./base";

/**
 * Directive `data-ot-img="reference"`
 * 
 * It inserts image element from {@link Page.event:update} inside its host.
 * The value in the Changes should be an instance of created and pre-loaded Image element. 
 * 
 * @hideconstructor
 */
export class otImg extends Directive {
  get name() {
    return "img";
  }

  update(changes) {
    let img = changes.pick(this.ref);
    if (!!img && !(img instanceof Image)) {
      throw new Error(`Invalid value for image: ${img}`);
    }
    setChild(this.elem, img);
  }
}

registerDirective("[data-ot-img]", otImg);
