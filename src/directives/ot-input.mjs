import { JSPath } from "../jspath";

import { toggleDisabled, isDisabled } from "../utils";

export function install_otInput(root, page) {
  root.querySelectorAll("[data-ot-input]").forEach((elem) => {
    const params = parse_params(elem);
    root.addEventListener("ot.reset", (event) => handle_reset(event, elem));
    root.addEventListener("ot.input", (event) => handle_phase(event, elem));
    if (params.trigger.change) {
        elem.addEventListener("change", (event) => handle_change(event, page, elem, params));
    }
    if (params.trigger.change && (elem.type == "text" || elem.tagName == "TEXTAREA")) {
      elem.addEventListener("keydown", (event) => handle_enter(event, page, elem, params));
    }
    if (params.trigger.click) {
        elem.addEventListener("click", (event) => handle_click(event, page, elem, params));
    }
    if (params.trigger.touch) {
        elem.addEventListener("touchend", (event) => handle_touch(event, page, elem, params));
    }
    if (params.trigger.key) {
        root.addEventListener("keydown", (event) => handle_key(event, page, elem, params));
    }
  });
}

function parse_trigger(elem) {
  return {
    click: "otClick" in elem.dataset || elem.tagName == "BUTTON",
    touch: "otTouch" in elem.dataset,
    key: "otKey" in elem.dataset ? elem.dataset.otKey : false,
    change: (elem.tagName == "INPUT" || elem.tagName == "SELECT" || elem.tagName == "TEXTAREA"),
  };
}

function parse_params(elem) {
  const match = elem.dataset.otInput.match(/^([\w.]+)(=(.+))?$/);
  if (!match) throw new Error(`Invalid expression for input: ${elem.dataset.otInput}`);

  let ref = new JSPath(match[1]);

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

function handle_phase(event, elem) {
  const { phase } = event.detail;
  toggleDisabled(elem, !phase);
}

function handle_reset(event, elem) {
  toggleDisabled(elem, true);
  elem.value = null;
}

function handle_change(event, page, elem, params) {
  if (elem.disabled) {
    page.error("frozen");
    return;
  }
  let value = elem.value;
  if (value === "true") val = true;
  if (value === "false") val = false;
  page.response(params.ref.expand(value));
}

function handle_click(event, page, elem, params) {
  if (isDisabled(elem)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response(params.ref.expand(params.val));
}

function handle_touch(event, page, elem, params) {
  if (isDisabled(elem)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response(params.ref.expand(params.val));
}

function handle_enter(event, page, elem, params) {
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

function handle_key(event, page, elem, params) {
  if (event.code != params.trigger.key) return;
  if (isDisabled(elem)) {
    page.error("frozen");
    return;
  }
  event.preventDefault();
  page.response(params.ref.expand(params.val));
}
