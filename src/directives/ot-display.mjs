import { toggleDisplay } from "../utils/dom";
import { Directive, registerDirective } from "./base";

class otDisplay extends Directive {
  get name() {
    return "display";
  }

  init() {
    this.phase = this.param();
    const match = this.phase.match(/^\w+$/);
    if (!match) throw new Error(`Invalid display phase: ${this.phase}`);
  }

  setup() {
    this.on('otree.time.phase', this.onPhase);
  }
  
  onPhase(event) {
    const phase = event.detail;
    if (!('display' in phase)) return;
    toggleDisplay(this.elem, phase.display == this.phase);
  }
}

registerDirective("[data-ot-display]", otDisplay);