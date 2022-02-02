import { toggleDisplay } from "../utils/dom";
import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-display="phaseflag"`
 * 
 * It shows/hides an element when {@link Phase} contains matching `display` field.
 * If the phase doesn't contain the field, it is ignored (i.e. phases toggling just `inputEnabled` do not affect the display). 
 * 
 * @hideconstructor
 */
class otDisplay extends DirectiveBase {
  get name() {
    return "display";
  }

  init() {
    let param = this.getParam('display');
    const match = param.match(/^\w+(\|\w+)?$/);
    if (!match) throw new Error(`Invalid display phase: ${this.phase}`);

    this.phases = param.split('|');
  }

  setup() {
    this.onPageEvent('ot.phase', this.onPhase);
  }
  
  onPhase(event, phase) {
    if (!('display' in phase)) return;
    toggleDisplay(this.elem, this.phases.includes(phase.display));
  }
}

registerDirective("[ot-display]", otDisplay);