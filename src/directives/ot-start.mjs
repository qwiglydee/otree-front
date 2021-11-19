import { onPage, onTarget } from "../utils/events";
import { toggleDisplay, toggleDisabled, isDisabled } from "../utils/dom";

export function otStart(page) {
  page.body.querySelectorAll("[data-ot-start]").forEach((target) => {
    const params = parse_trigger(target);
    if (params.click) onTarget({ page, target, ...params }, "click", handle_click);
    if (params.touch) onTarget({ page, target, ...params }, "touchend", handle_touch);
    if (params.key) onPage({ page, target, ...params }, "keydown", handle_key);
  });
}

function parse_trigger(elem) {
  return {
    click: "otClick" in elem.dataset,
    touch: "otTouch" in elem.dataset,
    key: "otKey" in elem.dataset ? elem.dataset.otKey : false,
  };
}

function disable(elem) {
  // TODO: detach handlers
  toggleDisplay(elem, false);
  elem.disabled = true;
}

function handle_click(conf, event) {
  const { page, target } = conf;
  if (isDisabled(target)) return;
  event.preventDefault();
  page.start();
  disable(target);
}

function handle_touch(conf, event) {
  const { page, target } = conf;
  if (isDisabled(target)) return;
  event.preventDefault();
  page.start();
  disable(target);
}

function handle_key(conf, event) {
  const { page, target, key } = conf;
  if (isDisabled(target)) return;
  if (event.code != key) return;
  event.preventDefault();
  page.start();
  disable(target);
}
