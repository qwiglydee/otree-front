import { toggleDisplay } from "../utils/dom";

export function otDisplay(page) {
  page.body.querySelectorAll("[data-ot-display]").forEach((elem) => {
    const phase = parse_params(elem);
    page.on("otree.reset", handle_reset, { elem });
    page.on("otree.phase", handle_phase, { elem, phase });
  });
}

function parse_params(elem) {
  const match = elem.dataset.otDisplay.match(/^\w+$/);
  if (!match) throw new Error(`Invalid display phase: ${elem.dataset.otDisplay}`);

  return elem.dataset.otDisplay;
}

function handle_reset(page, conf, event) {
  toggleDisplay(conf.elem, false);
}

function handle_phase(page, conf, event) {
  toggleDisplay(conf.elem, event.detail.display == conf.phase);
}
