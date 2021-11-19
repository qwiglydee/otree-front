import { Ref } from "../utils/changes";
import { onPage, onTarget } from "../utils/events";
import { toggleDisabled, isDisabled, isTextInput } from "../utils/dom";

export function otInput(page) {
  page.body.querySelectorAll("[data-ot-input]").forEach((target) => {
    const params = parse_params(target);
    onPage({ page, target }, "otree.reset", handle_reset);
    onPage({ page, target, ...params }, "otree.phase", handle_phase);
    if (params.trigger.change) onTarget({ page, target, ...params }, "change", handle_change);
    if (isTextInput(target)) onTarget({ page, target, ...params }, "keydown", handle_enter);
    if (params.trigger.click) onTarget({ page, target, ...params }, "click", handle_click);
    if (params.trigger.touch) onTarget({ page, target, ...params }, "touchend", handle_touch);
    if (params.trigger.key) onPage({ page, target, ...params }, "keydown", handle_key);
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

function handle_phase(conf, event) {
  const { page, target } = conf;
  const phase = event.detail;
  toggleDisabled(conf.target, !phase.input);
}

function handle_reset(conf, event) {
  const { target } = conf;
  toggleDisabled(target, true);
  target.value = null;
}

function handle_change(conf, event) {
  const { page, target } = conf;
  if (conf.target.disabled) {
    page.error("frozen");
    return;
  }
  let value = target.value;
  if (value === "true") value = true;
  if (value === "false") value = false;
  page.response({ [conf.ref]: value });
}

function handle_click(conf, event) {
  const { page, target } = conf;
  if (isDisabled(target)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response({ [conf.ref]: conf.val });
}

function handle_touch(conf, event) {
  const { page, target } = conf;
  if (isDisabled(target)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response({ [conf.ref]: conf.val });
}

function handle_enter(conf, event) {
  const { target } = conf;
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

function handle_key(conf, event) {
  const { page, target } = conf;
  if (event.code != conf.trigger.key) return;
  if (isDisabled(target)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response({ [conf.ref]: conf.val });
}
