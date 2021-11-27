import { Ref } from "../utils/changes";
import { toggleDisabled, isDisabled, isTextInput } from "../utils/dom";

import { Directive, registerDirective } from "./base";

class otRealInput extends Directive {
  get name() {
    return "input";
  }

  init() {
    this.ref = this.param();
    Ref.validate(this.ref);
  }

  setup() {
    this.on("otree.time.phase", this.onPhase);
    this.on("change", this.onChange, this.elem);
    if (isTextInput(this.elem)) this.on("keydown", this.onKey, this.elem);
  }

  onPhase(event, phase) {
    toggleDisabled(this.elem, !phase.input);
  }

  onChange(event) {
    let value = this.elem.value;
    if (value === "true") value = true;
    if (value === "false") value = false;
    this.page.response({ [this.ref]: value });
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


class otCustomInput extends Directive {
  get name() {
    return "input";
  }

  init() {
    const param = this.param();
    const match = param.match(/^([\w.]+)(=(.+))$/);
    if (!match) throw new Error(`Invalid expression for input: ${param}`);

    this.ref = match[1];
    Ref.validate(this.ref);
    
    this.val = match[3];
    if (this.val === "true") this.val = true;
    if (this.val === "false") this.val = false; 

    const dataset = this.elem.dataset;
    this.trigger = {
      click: "otClick" in dataset,
      touch: "otTouch" in dataset,
      key: "otKey" in dataset ? dataset.otKey : false,
    };

    if (this.elem.tagName == "BUTTON") this.trigger.click = true; 
  }

  setup() {
    this.on("otree.time.phase", this.onPhase);
    if (this.trigger.key) this.on("keydown", this.onKey, this.page);
    if (this.trigger.touch) this.on("touchend", this.onClick, this.elem);
    if (this.trigger.click) this.on("click", this.onClick, this.elem);
  }

  onPhase(event, phase) {
    if (!('input' in phase)) return;
    toggleDisabled(this.elem, !phase.input);
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.page.response({ [this.ref]: this.val });  
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.page.response({ [this.ref]: this.val });  
  }
}

registerDirective(
  "div[data-ot-input], span[data-ot-input], button[data-ot-input], kbd[data-ot-input]",
  otCustomInput
);