import { Ref, Changes } from "../utils/changes";
import { onPage, onTarget } from "../utils/events";
import { toggleDisabled, isDisabled, isTextInput } from "../utils/dom";

export function otInput(page) {
  page.body.querySelectorAll("[data-ot-input]").forEach((elem) => {
    const params = parse_params(elem);
    onPage(page, elem, params, "otree.reset", handle_reset);
    onPage(page, elem, params, "otree.phase", handle_phase);
    if (params.trigger.change) onTarget(page, elem, params, "change", handle_change);
    if (isTextInput(elem)) onTarget(page, elem, params, "keydown", handle_enter);
    if (params.trigger.click) onTarget(page, elem, params, "click", handle_click);
    if (params.trigger.touch) onTarget(page, elem, params, "touchend", handle_touch);
    if (params.trigger.key) onPage(page, elem, params, "keydown", handle_key);
  });
}

function parse_trigger(elem) {
  return {
    click: "otClick" in elem.dataset || elem.tagName == "BUTTON",
    touch: "otTouch" in elem.dataset,
    key: "otKey" in elem.dataset ? elem.dataset.otKey : false,
    change: elem.tagName == "INPUT" || elem.tagName == "SELECT" || elem.tagName == "TEXTAREA",
  };
}

function parse_params(elem) {
  const match = elem.dataset.otInput.match(/^([\w.]+)(=(.+))?$/);
  if (!match) throw new Error(`Invalid expression for input: ${elem.dataset.otInput}`);

  let ref = match[1];
  Ref.validate(ref);

  let val = match[3];
  if (val === "true") val = true;
  if (val === "false") val = false;

  let trigger = parse_trigger(elem);

  const tag = elem.tagName;

  if (Object.values(trigger).every((v) => !v)) {
    throw new Error(`Input requires trigger: ${elem.dataset.otInput}`);
  }

  if (trigger.change) {
    if (val !== undefined) throw new Error(`Built-in inputs don't override value: ${elem.dataset.otInput}`);
  } else {
    if (val === undefined) throw new Error(`Input requires value: ${elem.dataset.otInput}`);
  }

  return { ref, val, trigger };
}

function handle_phase(page, target, params, event) {
  const phase = event.detail;
  toggleDisabled(target, !phase.input);
}

function handle_reset(page, target, params, event) {
  toggleDisabled(target, true);
  target.value = null;
}

function handle_change(page, target, params, event) {
  if (target.disabled) {
    page.error("frozen");
    return;
  }
  let value = target.value;
  if (value === "true") value = true;
  if (value === "false") value = false;
  page.response(new Changes({ [params.ref]: value }));
}

function handle_click(page, target, params, event) {
  if (isDisabled(target)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response(new Changes({ [params.ref]: params.val }));
}

function handle_touch(page, target, params, event) {
  if (isDisabled(target)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response(new Changes({ [params.ref]: params.val }));
}

function handle_enter(page, target, params, event) {
  if (event.code == "Enter") {
    setTimeout(() =>
      target.dispatchEvent(
        new Event("change", {
          view: window,
          bubbles: false,
          cancelable: true,
        })
      )
    );
  }
}

function handle_key(page, target, params, event) {
  if (event.code != params.trigger.key) return;
  if (isDisabled(target)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response(new Changes({ [params.ref]: params.val }));
}
