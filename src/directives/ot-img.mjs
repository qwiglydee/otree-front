import { Ref } from "../utils/changes";
import { setChild } from "../utils/dom";

import { Directive, registerDirective } from "./base";


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
