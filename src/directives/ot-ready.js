import { toggleDisplay, toggleDisabled, isDisabled } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-ready`
 * 
 * It is activated by any configured trigger `ot-key="keycode"`, `ot-touch`, `ot-click`, and triggers {@link Page.event:start}. 
 * 
 * @hideconstructor
 */
class otReady extends DirectiveBase {
  get name() {
    return "ready";
  }

  init() {
    this.trigger = {
      click: this.elem.hasAttribute("ot-click"),
      touch: this.elem.hasAttribute("ot-touch"),
      key: this.elem.hasAttribute("ot-key") ?  this.elem.getAttribute("ot-key"): false,
    }
    this.disabled = false;
  }

  setup() {
    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onEvent("touchend", this.onClick, this.elem);
    if (this.trigger.click) this.onEvent("click", this.onClick, this.elem);
    this.onEvent('ot.ready', this.onStart);
  }

  onKey(event) {
    if (this.disabled) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.page.emitEvent('ot.ready'); 
  }

  onClick(event) {
    if (this.disabled) return;
    event.preventDefault();
    this.page.emitEvent('ot.ready'); 
  }

  onStart() {
    toggleDisplay(this.elem, false);
    toggleDisabled(this.elem, true);
  }
}

registerDirective("[ot-ready]", otReady);