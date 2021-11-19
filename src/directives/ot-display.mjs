import { onPage } from "../utils/events";
import { toggleDisplay } from "../utils/dom";

export function otDisplay(page) {
  page.body.querySelectorAll("[data-ot-display]").forEach((target) => {
    const phase = parse_params(target);
    onPage({ page, target }, "otree.reset", handle_reset);
    onPage({ page, target, phase }, "otree.phase", handle_phase);
  });
}

function parse_params(elem) {
  const match = elem.dataset.otDisplay.match(/^\w+$/);
  if (!match) throw new Error(`Invalid display phase: ${elem.dataset.otDisplay}`);

  return elem.dataset.otDisplay;
}

function handle_reset(conf, event) {
  toggleDisplay(conf.target, false);
}

function handle_phase(conf, event) {
  toggleDisplay(conf.target, event.detail.display == conf.phase);
}
