import { parseExpr, VarExpr, CmpExpr, InpExpr } from "../utils/expr";
import { toggleEnabled, isEnabled, isTextInput } from "../utils/dom";

import { DirectiveBase, registerDirective } from "./base";

/**
 * Conditional ot-enabled directive, using forced 'disabled' attribute
 * Handles reset/update/freeze events.
 */
class otEnabled extends DirectiveBase {
  init() {
    this.cond = parseExpr(this.getParam("enabled"));
    if (!(this.cond instanceof VarExpr || this.cond instanceof CmpExpr)) {
      throw new Error("expected var reference expression in ot-enabled");
    }

    this.enabled = false;
    toggleEnabled(this.elem, false);

    this.onEvent("ot.reset", this.reset);
    this.onEvent("ot.update", this.update);
    this.onEvent("ot.freezing", this.freeze);
  }

  reset(event) {
    if (!this.cond.affected(event)) return;
    this.enabled = false;
    toggleEnabled(this.elem, this.enabled);
  }

  update(event) {
    if (!this.cond.affected(event)) return;
    this.enabled = this.cond.eval(event);
    toggleEnabled(this.elem, this.enabled);
  }

  freeze(event, frozen) {
    toggleEnabled(this.elem, this.enabled && !frozen);
  }
}

registerDirective("[ot-enabled]", otEnabled);

/**
 * Directive `ot-input="var"` for native inputs:
 *
 * It triggers {@link Page.event:input} when value of the input changes.
 * For text inputs it triggers when `Enter` pressed.
 *
 * @hideconstructor
 */
class otRealInput extends DirectiveBase {
  init() {
    this.enablable = this.hasParam("enabled"); // controlled by ot-enabled directive

    this.var = parseExpr(this.getParam("input"));
    if (!(this.var instanceof VarExpr)) {
      throw new Error("expected var reference expression in ot-text");
    }

    this.onEvent("ot.reset", this.reset);
    this.onEvent("ot.update", this.update);
    this.onEvent("ot.freezing", this.freeze);
    if (isTextInput(this.elem)) {
      this.onElemEvent("keydown", this.onKey);
    } else {
      this.onElemEvent("change", this.submit);
    }

    if (!this.enablable) toggleEnabled(this.elem, true);
  }

  reset(event, vars) {
    if (!this.var.affected(event)) return;
    this.elem.value = null;
    if (!this.enablable) toggleEnabled(this.elem, true);
  }

  update(event, changes) {
    if (!this.var.affected(event)) return;
    this.elem.value = this.var.eval(event);
  }

  freeze(event, frozen) {
    if (!this.enablable) toggleEnabled(this.elem, !frozen);
  }

  onKey(event) {
    if (event.code == "Enter") {
      this.submit();
    }
  }

  submit() {
    this.page.input(this.var.ref, this.elem.value);
  }
}

registerDirective("[ot-input]:is(input, select, textarea)", otRealInput);

/*
 * Get triggers {@link Page.event:input} by a configred trigger:
 * - `ot-click` to trigger on click, implied for buttons
 * - `ot-touch` to trigger on touch
 * - `ot-key="keycode" to trigger on keypress
 *
 */
export function parseTriggers(directive) {
  return {
    click: directive.hasParam("click") || directive.elem.tagName == "BUTTON",
    touch: directive.hasParam("touch"),
    key: directive.hasParam("key") ? directive.getParam("key") : false,
  };
}

/**
 * Directive `ot-input="var = val"` for custom inputs
 *
 * The list of available is at MDN: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
 * Basically, it is something like 'Enter', 'Space', 'Escape', or 'KeyQ' for "q" key.
 *
 * @hideconstructor
 */
class otCustomInput extends DirectiveBase {
  init() {
    this.enablable = this.hasParam("enabled"); // controlled by ot-enabled directive

    this.expr = parseExpr(this.getParam("input"));
    if (!(this.expr instanceof InpExpr)) {
      throw new Error("expected assignment expression in ot-input");
    }

    this.trigger = parseTriggers(this);
    if (!this.trigger.key && !this.trigger.touch && !this.trigger.click) {
      throw new Error("ot-input missing any ot-click/ot-touch/ot-key");
    }

    if (!this.enablable) {
      toggleEnabled(this.elem, true);
      this.onEvent("ot.reset", this.reset);
      this.onEvent("ot.freezing", this.freeze);
    }

    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onElemEvent("touchend", this.onClick);
    if (this.trigger.click) this.onElemEvent("click", this.onClick);
  }

  reset(event) {
    toggleEnabled(this.elem, true);
  }

  freeze(event, frozen) {
    toggleEnabled(this.elem, !frozen);
  }

  onClick(event) {
    if (!isEnabled(this.elem)) return;
    event.preventDefault();
    this.submit();
  }

  onKey(event) {
    if (!isEnabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.submit();
  }

  submit() {
    this.page.emitEvent("ot.input", { name: this.expr.ref, value: this.expr.val });
  }
}

registerDirective("[ot-input]:not(input, select, textarea)", otCustomInput);

/**
 * Directive `ot-emit="eventtype"` emits custom event when triggered by ot-click/ot-touch/ot-key.
 *
 * Respect ot-enabled and freezing the same way as ot-input
 *
 * @hideconstructor
 */
class otEmit extends otCustomInput {
  init() {
    this.enablable = this.hasParam("enabled"); // controlled by ot-enabled directive

    this.evtype = this.getParam("emit");

    this.trigger = parseTriggers(this);
    if (!(this.trigger.key || this.trigger.touch || this.trigger.click)) {
      throw new Error("ot-emit missing any ot-click/ot-touch/ot-key");
    }

    if (!this.enablable) {
      toggleEnabled(this.elem, true);
      this.onEvent("ot.reset", this.reset);
      this.onEvent("ot.freezing", this.freeze);
    }

    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onElemEvent("touchend", this.onClick);
    if (this.trigger.click) this.onElemEvent("click", this.onClick);
  }

  reset(event) {
    toggleEnabled(this.elem, true);
  }

  freeze(event, frozen) {
    toggleEnabled(this.elem, !frozen);
  }

  onClick(event) {
    if (!isEnabled(this.elem)) return;
    event.preventDefault();
    this.submit();
  }

  onKey(event) {
    if (!isEnabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.submit();
  }

  submit() {
    this.page.emitEvent(this.evtype);
  }
}

registerDirective("[ot-emit]", otEmit);
