import { Ref } from "../utils/changes";
import { toggleDisabled, isDisabled, isTextInput } from "../utils/dom";

export function otInput(page) {
  page.body.querySelectorAll("[data-ot-input]").forEach((elem) => {
    const params = parse_params(elem);
    page.on("otree.reset", handle_reset, { elem });
    page.on("otree.phase", handle_phase, { elem, ...params });
    if (params.trigger.change) page.on("change", handle_change, { elem, ...params }, elem);
    if (isTextInput(elem)) page.on("keydown", handle_enter, { elem, ...params }, elem);
    if (params.trigger.click) page.on("click", handle_click, { elem, ...params }, elem);
    if (params.trigger.touch) page.on("touchend", handle_touch, { elem, ...params }, elem);
    if (params.trigger.key) page.on("keydown", handle_key, { elem, ...params });
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

function handle_phase(page, conf, event) {
  const { elem } = conf;
  const phase = event.detail;
  toggleDisabled(elem, !phase.input);
}

function handle_reset(page, conf, event) {
  const { elem } = conf;
  toggleDisabled(elem, true);
  elem.value = null;
}

function handle_change(page, conf, event) {
  const { elem, ref } = conf;
  if (elem.disabled) {
    page.error("frozen");
    return;
  }
  let value = elem.value;
  if (value === "true") value = true;
  if (value === "false") value = false;
  page.response({ [ref]: value });
}

function handle_click(page, conf, event) {
  const { elem, ref, val } = conf;
  if (isDisabled(elem)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response({ [ref]: val });
}

function handle_touch(page, conf, event) {
  const { elem, ref, val } = conf;
  if (isDisabled(elem)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response({ [ref]: val });
}

function handle_enter(page, conf, event) {
  const { elem } = conf;
  if (event.code == "Enter") {
    setTimeout(() =>
      elem.dispatchEvent(
        new Event("change", {
          view: window,
          bubbles: false,
          cancelable: true,
        })
      )
    );
  }
}

function handle_key(page, conf, event) {
  const { elem, ref, val, trigger } = conf;
  if (event.code != trigger.key) return;
  if (isDisabled(elem)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response({ [ref]: val });
}
