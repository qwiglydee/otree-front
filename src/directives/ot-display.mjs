import { toggleDisplay } from "../utils/dom";
import { Directive, registerDirective } from "./base";

class otDisplay extends Directive {
  get name() {
    return "display";
  }

  init() {
    let param = this.param();
    const match = param.match(/^\w+(\|\w+)?$/);
    if (!match) throw new Error(`Invalid display phase: ${this.phase}`);

    this.phases = param.split('|');
  }

  setup() {
    this.on('otree.time.phase', this.onPhase);
  }
  
  onPhase(event, phase) {
    if (!('display' in phase)) return;
    toggleDisplay(this.elem, this.phases.includes(phase.display));
  }
}

registerDirective("[data-ot-display]", otDisplay);