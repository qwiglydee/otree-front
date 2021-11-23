import { toggleDisplay, toggleDisabled, isDisabled } from "../utils/dom";

export function otStart(page) {
  page.body.querySelectorAll("[data-ot-start]").forEach((elem) => {
    const params = parse_trigger(elem);
    if (params.click) page.on("click", handle_click, { elem, ...params }, elem);
    if (params.touch) page.on("touchend", handle_touch, { elem, ...params }, elem);
    if (params.key) page.on("keydown", handle_key, { elem, ...params });
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

function handle_click(page, conf, event) {
  const { elem } = conf;
  if (isDisabled(elem)) return;
  event.preventDefault();
  page.start();
  disable(elem);
}

function handle_touch(page, conf, event) {
  const { elem } = conf;
  if (isDisabled(elem)) return;
  event.preventDefault();
  page.start();
  disable(elem);
}

function handle_key(page, conf, event) {
  const { elem, key } = conf;
  if (isDisabled(elem)) return;
  if (event.code != key) return;
  event.preventDefault();
  page.start();
  disable(elem);
}
