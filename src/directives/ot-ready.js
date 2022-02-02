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
  init() {
    this.trigger = {
      click: this.hasParam("click") || this.elem.tagName == "BUTTON",
      touch: this.hasParam("touch"),
      key: this.hasParam("key") ? this.getParam("key"): false,
    }; 
  }

  setup() {
    if (this.trigger.key) this.onPageEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onElemEvent("touchend", this.onClick);
    if (this.trigger.click) this.onElemEvent("click", this.onClick);
    this.onPageEvent('ot.ready', this.onStart);
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