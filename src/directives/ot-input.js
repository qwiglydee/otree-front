import { parseVar, evalVar, parseAssign, parseCond, evalCond, affecting } from "../utils/expr";
import { toggleDisabled, isDisabled, isTextInput } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";


/**
 * Base for input
 * 
 * handles `ot-enabled` and freezing.
 */
class otEnablable extends DirectiveBase {
  init() {
    if (this.hasParam('enabled')) {
      this.cond = parseCond(this.getParam('enabled')); 
      this.enabled = false; 
    } else {
      this.cond = null;
      this.enabled = true; 
    }
  }

  onReset(event, vars) {
    if (!this.cond) {
      this.enabled = true;
    } else if(affecting(this.cond, event)) {
      this.enabled = false;
    }

    toggleDisabled(this.elem, !this.enabled);
  }

  onUpdate(event, changes) {
    if (this.cond && affecting(this.cond, event)) {
      this.enabled = evalCond(this.cond, changes);
      toggleDisabled(this.elem, !this.enabled);
    }
  }

  onFreezing(event, frozen) {
    toggleDisabled(this.elem, !this.enabled || frozen);
  }
}

/**
 * Directive `ot-input="var"` for native inputs: `<input>`, `<select>`, `<textarea>`.
 * 
 * It triggers {@link Page.event:input} when value of the input changes.
 * For text inputs it triggers when `Enter` pressed.
 * 
 * @hideconstructor
 */
class otRealInput extends otEnablable {
  init() {
    super.init();
    this.var = parseVar(this.getParam('input'));
  }

  setup() {
    this.onEvent("ot.reset", this.onReset);
    this.onEvent("ot.update", this.onUpdate);
    this.onEvent("ot.freezing", this.onFreezing);
    if (isTextInput(this.elem)) {
      this.onElemEvent("keydown", this.onKey);
    } else {
      this.onElemEvent("change", this.onChange);
    }
  }

  onReset(event, vars) {
    super.onReset(event, vars);

    if (affecting(this.var, event)) {
      this.elem.value=null;
    }
  }

  onUpdate(event, changes) {
    super.onUpdate(event, changes);

    if (affecting(this.var, event)) {
      this.elem.value=evalVar(this.var, changes);
    }
  }

  onChange(event) {
    this.submit();
  }

  onKey(event) {
    if (event.code == "Enter") {
      this.submit();
    }
  }

  submit() {
    this.page.emitEvent('ot.input', {name: this.var.ref, value: this.elem.value});
  }
}

registerDirective(
  "[ot-input]:is(input, select, textarea)",
  otRealInput
);


export function parseTriggers(directive) {
  return {
    click: directive.hasParam("click") || directive.elem.tagName == "BUTTON",
    touch: directive.hasParam("touch"),
    key: directive.hasParam("key") ? directive.getParam("key"): false,
  }; 
}


/**
 * Directive `ot-input="var = val"` for custom inputs: any `<div>`, `<span>`, `<button>`, `<kbd>`.
 * 
 * The directive should be accompanied with method of triggering `ot-
 * 
 * It triggers {@link Page.event:input} by a configred trigger:
 * - `ot-click` to trigger on click
 * - `ot-touch` to trigger on touch
 * - `ot-key="keycode" to trigger on keypress
 * 
 * The list of available is at MDN: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values  
 * Basically, it is something like 'Enter', 'Space', 'Escape', or 'KeyQ' for "q" key.
* 
 * @hideconstructor
 */
class otCustomInput extends otEnablable {

  init() {
    super.init();
    this.ass = parseAssign(this.getParam('input'));
    this.trigger = parseTriggers(this);
  }

  setup() {
    this.onEvent("ot.reset", this.onReset);
    this.onEvent("ot.update", this.onUpdate);
    this.onEvent("ot.freezing", this.onFreezing);
    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onElemEvent("touchend", this.onClick);
    if (this.trigger.click) this.onElemEvent("click", this.onClick);
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.submit();
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.submit();
  }

  submit() {
    this.page.emitEvent('ot.input', {name: this.ass.ref, value: this.ass.val});
  }
}

registerDirective(
  "[ot-input]:not(input, select, textarea)",
  otCustomInput
);



/**
 * Directive `ot-emit="eventtype"` emits custom event when triggered by ot-click/ot-touch/ot-key.
 * 
 * Respect ot-enabled and freezing the same way as ot-input
 * 
 * @hideconstructor
 */
class otCustomEmit extends otEnablable {

  init() {
    super.init();
    this.evtype = this.getParam('emit');
    this.trigger = parseTriggers(this)
  }

  setup() {
    this.onEvent("ot.reset", this.onReset);
    this.onEvent("ot.update", this.onUpdate);
    this.onEvent("ot.freezing", this.onFreezing);
    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onElemEvent("touchend", this.onClick);
    if (this.trigger.click) this.onElemEvent("click", this.onClick);
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.submit();
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.submit();
  }

  submit() {
    this.page.emitEvent(this.evtype);
  }
}

registerDirective(
  "[ot-emit]",
  otCustomEmit
);