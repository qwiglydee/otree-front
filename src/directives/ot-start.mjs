import { toggleDisplay, toggleDisabled, isDisabled } from "../utils/dom";

import { Directive, registerDirective } from "./base";

class otStart extends Directive {
  get name() {
    return "start";
  }

  init() {
    const dataset = this.elem.dataset;
    this.trigger = {
      click: "otClick" in dataset,
      touch: "otTouch" in dataset,
      key: "otKey" in dataset ? dataset.otKey : false,
    }
  }

  setup() {
    if (this.trigger.key) this.on("keydown", this.onKey, this.page);
    if (this.trigger.touch) this.on("touchend", this.onClick, this.elem);
    if (this.trigger.click) this.on("click", this.onClick, this.elem);
    this.on('otree.page.start', this.onStart);
  }

  onKey(event) {
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.page.start(); 
  }

  onClick(event) {
    event.preventDefault();
    this.page.start();
  }

  onStart() {
    toggleDisplay(this.elem, false);
    this.off();
  }
}

registerDirective("[data-ot-start]", otStart);