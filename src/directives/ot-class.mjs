import { Ref } from "../utils/changes";
import { setClasses } from "../utils/dom";

import { Directive, registerDirective } from "./base";

class otClass extends Directive {
  get name() {
    return "class";
  }

  init() {
    super.init();
    this.defaults = Array.from(this.elem.classList);
  }

  reset() {
    // setClasses(this.elem, this.defaults);
  }

  update(changes) {
    let classes = this.defaults.slice();
    let val = changes.pick(this.ref);
    if (!!val) {
      classes.push(val);
    }
    setClasses(this.elem, classes);
  }
}

registerDirective("[data-ot-class]", otClass);