import { Ref } from "../utils/changes";
import { toggleDisabled, isDisabled, isTextInput } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Directive `ot-input` for native inputs: `<input>`, `<select>`, `<textarea>`.
 * 
 * It triggers {@link Page.event:response} when value of the input changes.
 * For text inputs it triggers when `Enter` pressed.
 * 
 * The input gets disabled according to {@link Phase} flag `input` 
 * 
 * @hideconstructor
 */
class otRealInput extends DirectiveBase {
  get name() {
    return "input";
  }

  init() {
  }

  setup() {
    this.onEvent("ot.reset", this.onReset);
    this.onEvent("ot.phase", this.onPhase);
    this.onEvent("change", this.onChange, this.elem);
    if (isTextInput(this.elem)) this.onEvent("keydown", this.onKey, this.elem);
  }

  onReset(event, vars) {
    this.elem.value=null;
  }

  onPhase(event, phase) {
    toggleDisabled(this.elem, !phase.input);
  }

  onChange(event) {
    let value = this.elem.value;
    if (value === "true") value = true;
    if (value === "false") value = false;
    this.page.emitInput(this.elem.name, value);
  }

  onKey(event) {
    if (event.code == "Enter") {
      // enforce change event
      setTimeout(() =>
      this.elem.dispatchEvent(
          new Event("change", {
            view: window,
            bubbles: false,
            cancelable: true,
          })
        )
      );
    }
  }
}

registerDirective(
  "input[data-ot-input], select[data-ot-input], textarea[data-ot-input]",
  otRealInput
);


/**
 * Directive `data-ot-input="field"` for custom inputs: any `<div>`, `<span>`, `<button>`, `<kbd>`.
 * 
 * The directive should be accompanied with method of triggering `data-ot-
 * 
 * It triggers {@link Page.event:response} by a configred trigger:
 * - `data-ot-click` to trigger on click
 * - `data-ot-touch` to trigger on touch
 * - `data-ot-key="keycode" to trigger on keypress
 * 
 * The list of available is at MDN: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values  
 * Basically, it is something like 'Enter', 'Space', 'Escape', or 'KeyQ' for "q" key.
 * 
 * The input gets disabled according to {@link Phase} flag `input` 
 * 
 * @hideconstructor
 */
class otCustomInput extends DirectiveBase {
  get name() {
    return "input";
  }

  init() {
    this.inp_name = this.elem.getAttribute('name');
    this.inp_value = this.elem.getAttribute('value');

    if (this.inp_value === undefined) {
      throw new Error("Missing value attribute for ot-input");
    }

    if (this.inp_value === "true") this.inp_value = true;
    if (this.inp_value === "false") this.inp_value = false; 

    const dataset = this.elem.dataset;
    this.trigger = {
      click: "otClick" in dataset,
      touch: "otTouch" in dataset,
      key: "otKey" in dataset ? dataset.otKey : false,
    };

    if (this.elem.tagName == "BUTTON") this.trigger.click = true; 
  }

  setup() {
    this.onEvent("ot.phase", this.onPhase);
    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onEvent("touchend", this.onClick, this.elem);
    if (this.trigger.click) this.onEvent("click", this.onClick, this.elem);
  }

  onPhase(event, phase) {
    if (!('input' in phase)) return;
    toggleDisabled(this.elem, !phase.input);
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.page.emitInput(this.inp_name, this.inp_value);  
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.page.emitInput(this.inp_name, this.inp_value);  
  }
}

registerDirective(
  "div[data-ot-input], span[data-ot-input], button[data-ot-input], kbd[data-ot-input]",
  otCustomInput
);