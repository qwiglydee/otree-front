import { parseVar, evalVar, parseAssign, evalAssign, affecting } from "../utils/expr";
import { toggleDisabled, isDisabled, isTextInput } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-input="var"` for native inputs: `<input>`, `<select>`, `<textarea>`.
 * 
 * It triggers {@link Page.event:response} when value of the input changes.
 * For text inputs it triggers when `Enter` pressed.
 * 
 * The input gets disabled according to {@link Phase} flag `input` 
 * 
 * @hideconstructor
 */
class otRealInput extends DirectiveBase {
  init() {
    this.var = parseVar(this.getParam('input'));
  }

  setup() {
    this.onPageEvent("ot.reset", this.onReset);
    this.onPageEvent("ot.update", this.onUpdate);
    this.onElemEvent("change", this.onChange);
    if (isTextInput(this.elem)) this.onElemEvent("keydown", this.onKey);
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      this.elem.value=null;
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      this.elem.value=evalVar(this.var, changes);
    }
  }

  onChange(event) {
    this.page.emitInput(this.var.ref, this.elem.value);
  }

  onKey(event) {
    if (event.code == "Enter") {
      this.page.emitInput(this.var.ref, this.elem.value);
    }
  }
}

registerDirective(
  "[ot-input]:is(input, select, textarea)",
  otRealInput
);


/**
 * Directive `ot-input="var = val"` for custom inputs: any `<div>`, `<span>`, `<button>`, `<kbd>`.
 * 
 * The directive should be accompanied with method of triggering `ot-
 * 
 * It triggers {@link Page.event:response} by a configred trigger:
 * - `ot-click` to trigger on click
 * - `ot-touch` to trigger on touch
 * - `ot-key="keycode" to trigger on keypress
 * 
 * The list of available is at MDN: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values  
 * Basically, it is something like 'Enter', 'Space', 'Escape', or 'KeyQ' for "q" key.
 * 
 * The input gets disabled according to {@link Phase} flag `input` 
 * 
 * @hideconstructor
 */
class otCustomInput extends DirectiveBase {
  init() {
    this.ass = parseAssign(this.getParam('input'));

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
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.page.emitInput(this.ass.ref, this.ass.val);  
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.page.emitInput(this.ass.ref, this.ass.val);  
  }
}

registerDirective(
  "[ot-input]:not(input, select, textarea)",
  otCustomInput
);