import { toggleDisplay } from "../utils/dom";
import { Directive, registerDirective } from "./base";

/**
 * Directive `data-ot-display="phaseflag"`
 * 
 * It shows/hides an element when {@link Phase} contains matching `display` field.
 * If the phase doesn't contain the field, it is ignored (i.e. phases toggling just `input` do not affect the display). 
 * 
 * @hideconstructor
 */
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
    this.on('ot.phase', this.onPhase);
  }
  
  onPhase(event, phase) {
    if (!('display' in phase)) return;
    toggleDisplay(this.elem, this.phases.includes(phase.display));
  }
}

registerDirective("[data-ot-display]", otDisplay);